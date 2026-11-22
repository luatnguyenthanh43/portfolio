import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { vi } from 'vitest'
import Login from '@/Pages/Auth/Login'
import Register from '@/Pages/Auth/Register'
import ForgotPassword from '@/Pages/Auth/ForgotPassword'
import ResetPassword from '@/Pages/Auth/ResetPassword'
import ConfirmPassword from '@/Pages/Auth/ConfirmPassword'
import { renderWithProviders } from '@/test/utils'
import { apiMock, getCsrfCookie, apiError, resetApiMock } from '@/test/mockApi'

vi.mock('@/lib/api', async () => {
    const m = await import('@/test/mockApi')
    return { default: m.apiMock, getCsrfCookie: m.getCsrfCookie }
})

const Loc = () => { const l = useLocation(); return <div data-testid="loc">{l.pathname + l.search}</div> }
const page = (el, path, route, opts) => renderWithProviders(
    <><Routes><Route path={path} element={el} /><Route path="*" element={<Loc />} /></Routes></>, { route, ...opts })

beforeEach(() => resetApiMock())

describe('Login', () => {
    it('submits credentials via auth.login and navigates to /dashboard', async () => {
        const login = vi.fn().mockResolvedValue({})
        page(<Login />, '/login', '/login', { auth: { login } })
        await userEvent.type(screen.getByLabelText('Email'), 'a@b.io')
        await userEvent.type(screen.getByLabelText('Password'), 'secret')
        await userEvent.click(screen.getByLabelText('Remember me'))
        await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
        expect(login).toHaveBeenCalledWith({ email: 'a@b.io', password: 'secret', remember: true })
        expect(await screen.findByTestId('loc')).toHaveTextContent('/dashboard')
    })

    it('shows validation errors and clears the password', async () => {
        const login = vi.fn().mockRejectedValue(apiError(422, { errors: { email: ['These credentials do not match.'] } }))
        page(<Login />, '/login', '/login', { auth: { login } })
        await userEvent.type(screen.getByLabelText('Email'), 'a@b.io')
        await userEvent.type(screen.getByLabelText('Password'), 'bad')
        await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
        expect(await screen.findByText('These credentials do not match.')).toBeInTheDocument()
        await waitFor(() => expect(screen.getByLabelText('Password')).toHaveValue(''))
        expect(screen.getByLabelText('Email')).toHaveValue('a@b.io')
    })

    it('falls back to the error message / "Login failed"', async () => {
        const login = vi.fn().mockRejectedValue(apiError(500, {}))
        page(<Login />, '/login', '/login', { auth: { login } })
        await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
        expect(await screen.findByText('Login failed')).toBeInTheDocument()
    })

    it('links to forgot-password', () => {
        page(<Login />, '/login', '/login')
        expect(screen.getByRole('link', { name: 'Forgot your password?' })).toHaveAttribute('href', '/forgot-password')
    })

    // BUG (e): ResetPassword redirects to /login?status=password-reset but Login only reads a
    // `status` prop that the router never passes.
    it('BUG(e): shows a status message for ?status=password-reset', () => {
        page(<Login />, '/login', '/login?status=password-reset')
        expect(screen.getByText(/password has been reset/i)).toBeInTheDocument()
    })
})

describe('Register', () => {
    it('submits the payload and navigates to /dashboard', async () => {
        const register = vi.fn().mockResolvedValue({})
        page(<Register />, '/register', '/register', { auth: { register } })
        await userEvent.type(screen.getByLabelText('Name'), 'Ada')
        await userEvent.type(screen.getByLabelText('Email'), 'a@b.io')
        await userEvent.type(screen.getByLabelText('Password'), 'pw123456')
        await userEvent.type(screen.getByLabelText('Confirm Password'), 'pw123456')
        await userEvent.click(screen.getByRole('button', { name: 'Register' }))
        expect(register).toHaveBeenCalledWith({ name: 'Ada', email: 'a@b.io', password: 'pw123456', password_confirmation: 'pw123456' })
        expect(await screen.findByTestId('loc')).toHaveTextContent('/dashboard')
    })

    it('shows per-field errors and clears passwords', async () => {
        const register = vi.fn().mockRejectedValue(apiError(422, { errors: { email: ['Taken'], password: ['Too short'] } }))
        page(<Register />, '/register', '/register', { auth: { register } })
        await userEvent.type(screen.getByLabelText('Name'), 'Ada')
        await userEvent.type(screen.getByLabelText('Email'), 'a@b.io')
        await userEvent.type(screen.getByLabelText('Password'), 'x')
        await userEvent.type(screen.getByLabelText('Confirm Password'), 'x')
        await userEvent.click(screen.getByRole('button', { name: 'Register' }))
        expect(await screen.findByText('Taken')).toBeInTheDocument()
        expect(screen.getByText('Too short')).toBeInTheDocument()
        await waitFor(() => expect(screen.getByLabelText('Password')).toHaveValue(''))
    })
})

describe('ForgotPassword', () => {
    it('gets CSRF, posts the email and shows the status message', async () => {
        apiMock.post.mockResolvedValue({ data: { message: 'We have emailed your link.' } })
        page(<ForgotPassword />, '/forgot-password', '/forgot-password')
        await userEvent.type(screen.getByRole('textbox'), 'a@b.io')
        await userEvent.click(screen.getByRole('button', { name: 'Email Password Reset Link' }))
        expect(await screen.findByText('We have emailed your link.')).toBeInTheDocument()
        expect(getCsrfCookie).toHaveBeenCalled()
        expect(apiMock.post).toHaveBeenCalledWith('/forgot-password', { email: 'a@b.io' })
    })

    it('shows validation errors', async () => {
        apiMock.post.mockRejectedValue(apiError(422, { errors: { email: ["We can't find a user with that email address."] } }))
        page(<ForgotPassword />, '/forgot-password', '/forgot-password')
        await userEvent.type(screen.getByRole('textbox'), 'no@b.io')
        await userEvent.click(screen.getByRole('button', { name: 'Email Password Reset Link' }))
        expect(await screen.findByText(/can't find a user/)).toBeInTheDocument()
    })
})

describe('ResetPassword', () => {
    it('prefills token/email from the query string, posts and redirects to /login?status=password-reset', async () => {
        page(<ResetPassword />, '/reset-password', '/reset-password?token=tok&email=a@b.io')
        expect(screen.getByLabelText('Email')).toHaveValue('a@b.io')
        await userEvent.type(screen.getByLabelText('Password'), 'newpass12')
        await userEvent.type(screen.getByLabelText('Confirm Password'), 'newpass12')
        await userEvent.click(screen.getByRole('button', { name: 'Reset Password' }))
        expect(await screen.findByTestId('loc')).toHaveTextContent('/login?status=password-reset')
        expect(getCsrfCookie).toHaveBeenCalled()
        expect(apiMock.post).toHaveBeenCalledWith('/reset-password', { token: 'tok', email: 'a@b.io', password: 'newpass12', password_confirmation: 'newpass12' })
    })

    it('shows errors (e.g. invalid token) and clears the passwords', async () => {
        apiMock.post.mockRejectedValue(apiError(422, { errors: { email: ['This password reset token is invalid.'] } }))
        page(<ResetPassword />, '/reset-password', '/reset-password?token=bad&email=a@b.io')
        await userEvent.type(screen.getByLabelText('Password'), 'newpass12')
        await userEvent.click(screen.getByRole('button', { name: 'Reset Password' }))
        expect(await screen.findByText('This password reset token is invalid.')).toBeInTheDocument()
        await waitFor(() => expect(screen.getByLabelText('Password')).toHaveValue(''))
    })
})

describe('ConfirmPassword', () => {
    it('posts the password and shows errors on failure', async () => {
        apiMock.post.mockRejectedValue(apiError(422, { errors: { password: ['The provided password is incorrect.'] } }))
        page(<ConfirmPassword />, '/confirm-password', '/confirm-password')
        await userEvent.type(screen.getByLabelText('Password'), 'x')
        await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
        expect(await screen.findByText('The provided password is incorrect.')).toBeInTheDocument()
        expect(apiMock.post).toHaveBeenCalledWith('/confirm-password', { password: 'x' })
    })

    // BUG (g): the backend has no POST /api/confirm-password route, so this page can never succeed.
    it('BUG(g): ConfirmPassword should not post to the nonexistent /confirm-password endpoint', async () => {
        page(<ConfirmPassword />, '/confirm-password', '/confirm-password')
        await userEvent.type(screen.getByLabelText('Password'), 'x')
        await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
        await waitFor(() => expect(apiMock.post).toHaveBeenCalled())
        expect(apiMock.post).not.toHaveBeenCalledWith('/confirm-password', expect.anything())
    })
})
