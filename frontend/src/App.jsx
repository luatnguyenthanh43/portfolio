import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { useAuth } from '@/hooks/useAuth'
import { ToastProvider } from '@/contexts/ToastContext'
import Welcome from '@/Pages/Welcome'
const Dashboard = lazy(() => import('@/Pages/Dashboard'))
const Login = lazy(() => import('@/Pages/Auth/Login'))
const Register = lazy(() => import('@/Pages/Auth/Register'))
const ForgotPassword = lazy(() => import('@/Pages/Auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@/Pages/Auth/ResetPassword'))
const VerifyEmail = lazy(() => import('@/Pages/Auth/VerifyEmail'))
const ConfirmPassword = lazy(() => import('@/Pages/Auth/ConfirmPassword'))
const Profile = lazy(() => import('@/Pages/Profile/Edit'))

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
        <Suspense fallback={null}>
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
        </Suspense>
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
