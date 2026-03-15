import { createContext, ReactNode, useEffect, useMemo, useState } from "react"

import { storageUserGet, storageUserRemove, storageUserSave } from "@/storage/storageUser"

import {
	getUserRoles,
	getUserTeams,
	hasAnyRole,
	hasAnyTeam,
	hasRole,
	hasTeam,
} from "@/auth/permissions"
import { UserDTO } from "@/dtos/userDTO"
import { server } from "@/server/api"
import {
	storageAuthTokenGet,
	storageAuthTokenRemove,
	storageAuthTokenSave,
} from "@/storage/storageAuthToken"
import { update } from "@/utils/configDataApp"

export type AuthContextDataProps = {
	user: UserDTO | null
	roles: string[]
	teams: string[]

	can: {
		hasRole: (role: string) => boolean
		hasAnyRole: (roles: string[]) => boolean
		hasTeam: (alias: string) => boolean
		hasAnyTeam: (aliases: string[]) => boolean
	}

	isBootstrapping: boolean
	authSubmitting: boolean

	signIn: (email: string, password: string) => Promise<void>
	signOut: () => Promise<void>
}

type AuthContextProviderProps = {
	children: ReactNode
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps)

export function AuthContextProvider({ children }: AuthContextProviderProps) {
	const [user, setUser] = useState<UserDTO | null>(null)
	const [isBootstrapping, setIsBootstrapping] = useState(true)
	const [authSubmitting, setAuthSubmitting] = useState(false)

	function applyAuthHeader(token: string | null) {
		if (token) server.defaults.headers.common["Authorization"] = `Bearer ${token}`
		else delete server.defaults.headers.common["Authorization"]
	}

	async function signIn(email: string, password: string) {
		console.log("signIn")

		setAuthSubmitting(true)
		try {
			const { data } = await server.post("/login", { email, password })
			console.log("Response => ", data)
			if (data?.user && data?.access_token) {
				await Promise.all([
					storageUserSave(data.user),
					storageAuthTokenSave(data.access_token),
				])
				applyAuthHeader(data.access_token)
				setUser(data.user)
				// const token = (await ensureRegistered()) ?? pushToken
				// await api.post("/device/register", { token, platform: "android" })
			}
			update()
		} finally {
			setAuthSubmitting(false)
		}
	}

	async function signOut() {
		setAuthSubmitting(true)
		try {
			await Promise.all([storageUserRemove(), storageAuthTokenRemove()])
			applyAuthHeader(null)
			setUser(null)
		} finally {
			setAuthSubmitting(false)
		}
	}

	async function loadUserData() {
		setIsBootstrapping(true)
		try {
			const [userLogged, token] = await Promise.all([storageUserGet(), storageAuthTokenGet()])
			if (userLogged && token) {
				applyAuthHeader(token)
				setUser(userLogged)
			} else {
				applyAuthHeader(null)
				setUser(null)
			}
		} finally {
			setIsBootstrapping(false)
		}
	}

	useEffect(() => {
		loadUserData()
	}, [])

	const roles = useMemo(() => getUserRoles(user), [user])
	const teams = useMemo(() => getUserTeams(user), [user])

	const can = useMemo(
		() => ({
			hasRole: (role: string) => hasRole(user, role),
			hasAnyRole: (rolesList: string[]) => hasAnyRole(user, rolesList),
			hasTeam: (alias: string) => hasTeam(user, alias),
			hasAnyTeam: (aliases: string[]) => hasAnyTeam(user, aliases),
		}),
		[user],
	)

	const value = useMemo(
		() => ({
			user,
			roles,
			teams,
			can,
			isBootstrapping,
			authSubmitting,
			signIn,
			signOut,
		}),
		[user, roles, teams, can, isBootstrapping, authSubmitting],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
