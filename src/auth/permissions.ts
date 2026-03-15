import { UserDTO } from "@/dtos/userDTO"

export function getUserRoles(user: UserDTO | null): string[] {
    if (!user?.teams?.length) return []
    return user.teams.flatMap(t => (t.roles ?? []).map(r => r.name)).filter(Boolean)
}

export function getUserTeams(user: UserDTO | null): string[] {
    return (user?.teams ?? []).map(t => t.alias).filter(Boolean)
}

export function hasRole(user: UserDTO | null, role: string): boolean {
    return getUserRoles(user).includes(role)
}

export function hasAnyRole(user: UserDTO | null, roles: string[]): boolean {
    const set = new Set(getUserRoles(user))
    return roles.some(r => set.has(r))
}

export function hasTeam(user: UserDTO | null, teamAlias: string): boolean {
    return getUserTeams(user).includes(teamAlias)
}

export function hasAnyTeam(user: UserDTO | null, aliases: string[]): boolean {
    const set = new Set(getUserTeams(user))
    return aliases.some(a => set.has(a))
}