import { createContext, useContext, useEffect, useState } from 'react'
import api, { getCsrfCookie } from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(undefined)

    useEffect(() => {
        api.get('/user').then(r => setUser(r.data)).catch(() => setUser(null))
    }, [])

    const login = async (credentials) => {
        await getCsrfCookie()
        const { data } = await api.post('/login', credentials)
        setUser(data.user)
        return data
    }

    const register = async (payload) => {
        await getCsrfCookie()
        const { data } = await api.post('/register', payload)
        setUser(data.user)
        return data
    }

    const logout = async () => {
        await api.post('/logout')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
