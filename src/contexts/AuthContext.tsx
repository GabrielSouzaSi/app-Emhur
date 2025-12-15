import { createContext, ReactNode, useEffect, useMemo, useState } from "react"

import { storageUserGet, storageUserRemove, storageUserSave } from "@/storage/storageUser"

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
	isBootstrapping: boolean // <— só no boot
	authSubmitting: boolean // <— login/logout em andamento
	signIn: (email: string, password: string) => Promise<void>
	signOut: () => Promise<void>
}

type AuthContextProviderProps = {
	children: ReactNode
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps)

export function AuthContextProvider({ children }: AuthContextProviderProps) {
	const [user, setUser] = useState<UserDTO>({} as UserDTO)
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

	const value = useMemo(
		() => ({ user, isBootstrapping, authSubmitting, signIn, signOut }),
		[user, isBootstrapping, authSubmitting]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
