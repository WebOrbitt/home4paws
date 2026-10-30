import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { currentUser, login as loginRequest, logout as logoutRequest, registerAdopter, registerOrganization as registerOrganizationRequest, updateUserProfile } from '../services/authService.js'
import { refreshSession, setAccessToken } from '../services/api.js'

export const AuthStatus = Object.freeze({
  LOGGED_OUT: 'logged_out',
  LOGGED_IN: 'logged_in',
  PENDING_ORGANIZATION: 'pending_organization',
  VERIFIED_ORGANIZATION: 'verified_organization',
  REJECTED_ORGANIZATION: 'rejected_organization',
})

export const AuthRole = Object.freeze({
  ADMIN: 'ADMIN',
  USER: 'USER',
  NGO: 'NGO',
  SHELTER: 'SHELTER',
})

const AuthContext = createContext(null)

function sessionState(user, organization = null) {
  if (['NGO', 'SHELTER'].includes(user?.role)) {
    const nextOrg = organization ? { ...organization, verificationStatus: organization.status } : null
    if (nextOrg?.status === 'Approved') return { status: AuthStatus.VERIFIED_ORGANIZATION, user, organization: nextOrg }
    if (nextOrg?.status === 'Rejected') return { status: AuthStatus.REJECTED_ORGANIZATION, user, organization: nextOrg }
    return { status: AuthStatus.PENDING_ORGANIZATION, user, organization: nextOrg }
  }
  return user
    ? { status: AuthStatus.LOGGED_IN, user, organization: null }
    : { status: AuthStatus.LOGGED_OUT, user: null, organization: null }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({ status: AuthStatus.LOGGED_OUT, user: null, organization: null })
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      await refreshSession()
      const data = await currentUser()
      setAuthState(sessionState(data.user, data.organization))
      return data
    } catch {
      setAccessToken(null)
      setAuthState({ status: AuthStatus.LOGGED_OUT, user: null, organization: null })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials)
    const current = await currentUser()
    setAuthState(sessionState(current.user || data.user, current.organization))
    return current
  }, [])

  const register = useCallback(async (values) => {
    const data = await registerAdopter(values)
    const current = await currentUser()
    setAuthState(sessionState(current.user || data.user, current.organization))
    return current
  }, [])

  const registerOrganization = useCallback(async (formData) => {
    const data = await registerOrganizationRequest(formData)
    setAccessToken(data.accessToken)
    setAuthState(sessionState(data.user, data.organization))
    return data.organization
  }, [])

  const signOut = useCallback(async () => {
    await logoutRequest()
    setAuthState({ status: AuthStatus.LOGGED_OUT, user: null, organization: null })
  }, [])

  const updateProfile = useCallback(async (changes) => {
    const data = await updateUserProfile(changes)
    setAuthState((current) => current.user
      ? { ...current, user: { ...current.user, ...data.user } }
      : current)
    return data.user
  }, [])

  const refreshOrganization = useCallback(async () => {
    const data = await currentUser()
    setAuthState(sessionState(data.user, data.organization))
    return data.organization
  }, [])

  const value = useMemo(() => ({
    ...authState,
    isLoading,
    isLoggedIn: authState.status === AuthStatus.LOGGED_IN || authState.status === AuthStatus.VERIFIED_ORGANIZATION,
    login,
    register,
    registerOrganization,
    signOut,
    updateProfile,
    refreshOrganization,
    refresh,
  }), [authState, isLoading, login, register, registerOrganization, signOut, updateProfile, refreshOrganization, refresh])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
