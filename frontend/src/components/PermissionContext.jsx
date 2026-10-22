import PermissionContext from './permissionsContext'

export function PermissionProvider({ permissions, children }) {
  return <PermissionContext.Provider value={permissions}>{children}</PermissionContext.Provider>
}
