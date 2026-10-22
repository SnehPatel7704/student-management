import { useContext } from 'react'
import PermissionContext from '../components/permissionsContext'

export default function usePermissions() {
  return useContext(PermissionContext)
}