export type RoleDTO = {
  id: number
  name: string
}

export type TeamDTO = {
  id: number
  alias: string
  name: string
  roles: RoleDTO[]
}

export type UserDTO = {
  id: number
  name: string
  email: string
  active: boolean
  teams: TeamDTO[]
}