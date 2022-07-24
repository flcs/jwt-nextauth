interface ValidateUserPermissionsParams {
  user?: User
  permissions?: string[]
  roles?: string[]
}
interface User {
  permissions: string[]
  roles: string[]
}
export function validateUserPermissions({
  user,
  permissions,
  roles,
}: ValidateUserPermissionsParams) {
  if (permissions?.length) {
    const hasAllPermissions = permissions.every((permission) => {
      return user?.permissions?.includes(permission)
    })

    if (!hasAllPermissions) {
      return false
    }
  }

  if (roles?.length) {
    const hasSomeRole = roles.some((role) => {
      return user?.roles?.includes(role)
    })

    if (!hasSomeRole) {
      return false
    }
  }

  return true
}
