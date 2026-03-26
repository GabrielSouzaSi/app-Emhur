import { UserDTO } from "@/dtos/userDTO"

export function getPrimaryTeam(user: UserDTO | null) {
    if (!user?.teams?.length) return null
    return user.teams[0]
}

export function getPrimaryTeamId(user: UserDTO | null): number | null {
    return getPrimaryTeam(user)?.id ?? null
}

export function getPrimaryTeamAlias(user: UserDTO | null): string | null {
    return getPrimaryTeam(user)?.alias ?? null
}

export function getUserRoles(user: UserDTO | null): string[] {
    if (!user?.teams?.length) return []

    return [
        ...new Set(
            user.teams.flatMap((t) => (t.roles ?? []).map((r) => r.name)).filter(Boolean)
        ),
    ]
}

export function getUserTeams(user: UserDTO | null): string[] {
    return [...new Set((user?.teams ?? []).map((t) => t.alias).filter(Boolean))]
}

export function hasRole(user: UserDTO | null, role: string): boolean {
    return getUserRoles(user).includes(role)
}

export function hasAnyRole(user: UserDTO | null, roles: string[]): boolean {
    const set = new Set(getUserRoles(user))
    return roles.some((r) => set.has(r))
}

export function hasTeam(user: UserDTO | null, teamAlias: string): boolean {
    return getUserTeams(user).includes(teamAlias)
}

export function hasAnyTeam(user: UserDTO | null, aliases: string[]): boolean {
    const set = new Set(getUserTeams(user))
    return aliases.some((a) => set.has(a))
}

export function hasTeamId(user: UserDTO | null, teamId: number): boolean {
    return (user?.teams ?? []).some((team) => team.id === teamId)
}

export function hasAnyTeamId(user: UserDTO | null, teamIds: number[]): boolean {
    const set = new Set((user?.teams ?? []).map((team) => team.id))
    return teamIds.some((id) => set.has(id))
}

export function getTeamByAlias(user: UserDTO | null, alias: string) {
    return (user?.teams ?? []).find((team) => team.alias === alias) ?? null
}