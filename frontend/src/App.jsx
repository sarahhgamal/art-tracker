import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Gallery from './pages/Gallery'
import Sessions from './pages/Sessions'
import PrivateRoute from './components/PrivateRoute'

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Gallery /></PrivateRoute>} />
            <Route path="/sessions" element={<PrivateRoute><Sessions /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}