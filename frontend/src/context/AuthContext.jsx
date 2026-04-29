import { createContext, useContext, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token')
        const username = localStorage.getItem('username')
        return token ? { token, username } : null
    })

    if (user?.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`
    } else {
        delete axios.defaults.headers.common['Authorization']
    }

    const login = (authResponse) => {
        localStorage.setItem('token', authResponse.token)
        localStorage.setItem('username', authResponse.username)
        axios.defaults.headers.common['Authorization'] = `Bearer ${authResponse.token}`
        setUser({ token: authResponse.token, username: authResponse.username })
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        delete axios.defaults.headers.common['Authorization']
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)