import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import Welcome from '@/Pages/Welcome'
import Dashboard from '@/Pages/Dashboard'
import Login from '@/Pages/Auth/Login'
import Register from '@/Pages/Auth/Register'
import ForgotPassword from '@/Pages/Auth/ForgotPassword'
import ResetPassword from '@/Pages/Auth/ResetPassword'
import VerifyEmail from '@/Pages/Auth/VerifyEmail'
import ConfirmPassword from '@/Pages/Auth/ConfirmPassword'
import Profile from '@/Pages/Profile/Edit'

function PrivateRoute({ children }) {
    const { user } = useAuth()
    if (user === undefined) return null
    return user ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
    const { user } = useAuth()
    if (user === undefined) return null
    return user ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
            <Route path="/verify-email" element={<PrivateRoute><VerifyEmail /></PrivateRoute>} />
            <Route path="/confirm-password" element={<PrivateRoute><ConfirmPassword /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    <AppRoutes />
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}
