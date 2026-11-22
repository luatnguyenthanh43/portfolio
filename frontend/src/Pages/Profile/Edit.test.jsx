import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { vi } from 'vitest'
import Edit from '@/Pages/Profile/Edit'
import { renderWithProviders } from '@/test/utils'
import { apiMock, apiError, resetApiMock } from '@/test/mockApi'
import { AuthProvider } from '@/contexts/AuthContext'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '@/contexts/ToastContext'

vi.mock('@/lib/api', async () => {
    const m = await import('@/test/mockApi')
    return { default: m.apiMock, getCsrfCookie: m.getCsrfCookie }
})

const USER = { id: 1, name: 'Ada', email: 'ada@x.io' }
const Loc = () => <div data-testid="loc">{useLocation().pathname}</div>
const page = (opts = {}) => renderWithProviders(
    <Routes><Route path="/profile" element={<Edit />} /><Route path="*" element={<Loc />} /></Routes>,
    { route: '/profile', user: USER, ...opts })

beforeEach(() => resetApiMock())

describe('Profile information form', () => {
    it('prefills from the user and PATCHes /profile, then updates the user', async () => {
        const setUser = vi.fn()
        apiMock.patch.mockResolvedValue({ data: { user: { ...USER, name: 'Grace' } } })
        page({ auth: { setUser } })
        const name = screen.getByLabelText('Name')
        expect(name).toHaveValue('Ada')
        expect(screen.getByLabelText('Email')).toHaveValue('ada@x.io')
        await userEvent.clear(name)
        await userEvent.type(name, 'Grace')
        await userEvent.click(screen.getAllByRole('button', { name: 'Save' })[0])
        await waitFor(() => expect(apiMock.patch).toHaveBeenCalledWith('/profile', { name: 'Grace', email: 'ada@x.io' }))
        expect(setUser).toHaveBeenCalledWith({ ...USER, name: 'Grace' })
        expect(await screen.findByText('Saved.')).toBeInTheDocument()
    })

    it('shows validation errors', async () => {
        apiMock.patch.mockRejectedValue(apiError(422, { errors: { email: ['The email has already been taken.'] } }))
        page()
        await userEvent.click(screen.getAllByRole('button', { name: 'Save' })[0])
        expect(await screen.findByText('The email has already been taken.')).toBeInTheDocument()
        expect(screen.queryByText('Saved.')).not.toBeInTheDocument()
    })
})

describe('Update password form', () => {
    const fill = async (cur, pw, conf) => {
        await userEvent.type(screen.getByLabelText('Current Password'), cur)
        await userEvent.type(screen.getByLabelText('New Password'), pw)
        await userEvent.type(screen.getByLabelText('Confirm Password'), conf)
        await userEvent.click(screen.getAllByRole('button', { name: 'Save' })[1])
    }

    it('PUTs /password, clears the fields and shows Saved.', async () => {
        page()
        await fill('old', 'newpassword', 'newpassword')
        await waitFor(() => expect(apiMock.put).toHaveBeenCalledWith('/password', { current_password: 'old', password: 'newpassword', password_confirmation: 'newpassword' }))
        await waitFor(() => expect(screen.getByLabelText('New Password')).toHaveValue(''))
        expect(await screen.findByText('Saved.')).toBeInTheDocument()
    })

    it('shows errors and clears the offending fields', async () => {
        apiMock.put.mockRejectedValue(apiError(422, { errors: { current_password: ['Wrong password.'], password: ['Too weak.'] } }))
        page()
        await fill('old', 'x', 'x')
        expect(await screen.findByText('Wrong password.')).toBeInTheDocument()
        expect(screen.getByText('Too weak.')).toBeInTheDocument()
        await waitFor(() => expect(screen.getByLabelText('Current Password')).toHaveValue(''))
        expect(screen.getByLabelText('New Password')).toHaveValue('')
    })
})

describe('Delete account form', () => {
    const openAndSubmit = async (pw = 'secret') => {
        await userEvent.click(screen.getByRole('button', { name: 'Delete Account' }))
        const dialog = await screen.findByRole('dialog')
        await userEvent.type(dialog.querySelector('input[type=password]'), pw)
        const buttons = dialog.querySelectorAll('button')
        await userEvent.click(buttons[buttons.length - 1])
    }

    it('opens a confirmation modal and cancels', async () => {
        page()
        await userEvent.click(screen.getByRole('button', { name: 'Delete Account' }))
        expect(await screen.findByRole('dialog')).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
        expect(apiMock.delete).not.toHaveBeenCalled()
    })

    it('DELETEs /profile with the password, logs out and redirects home', async () => {
        const { auth } = page()
        await openAndSubmit()
        await waitFor(() => expect(apiMock.delete).toHaveBeenCalledWith('/profile', { data: { password: 'secret' } }))
        await waitFor(() => expect(auth.logout).toHaveBeenCalled())
        expect(await screen.findByTestId('loc')).toHaveTextContent('/')
    })

    it('shows the password error and stays on the page when deletion is rejected', async () => {
        apiMock.delete.mockRejectedValue(apiError(422, { errors: { password: ['The password is incorrect.'] } }))
        const { auth } = page()
        await openAndSubmit('nope')
        expect(await screen.findByText('The password is incorrect.')).toBeInTheDocument()
        expect(auth.logout).not.toHaveBeenCalled()
        expect(screen.queryByTestId('loc')).not.toBeInTheDocument()
    })

    // BUG (a): after DELETE /profile the session is gone, so POST /logout returns 401. logout()
    // throws, the catch block swallows it as a validation error, and the user is stuck on
    // /profile with the modal open and the stale user still set.
    it('BUG(a): clears the user and redirects home even if /logout returns 401', async () => {
        const logout = vi.fn().mockRejectedValue(apiError(401, { message: 'Unauthenticated.' }))
        const setUser = vi.fn()
        page({ auth: { logout, setUser } })
        await openAndSubmit()
        await waitFor(() => expect(logout).toHaveBeenCalled())
        expect(await screen.findByTestId('loc')).toHaveTextContent('/')
    })

    it('BUG(a) end-to-end with the real AuthProvider: user is cleared after delete + 401 logout', async () => {
        apiMock.get.mockResolvedValue({ data: USER })
        apiMock.post.mockRejectedValue(apiError(401))
        render(
            <MemoryRouter initialEntries={['/profile']}>
                <AuthProvider><ToastProvider>
                    <Routes><Route path="/profile" element={<Edit />} /><Route path="*" element={<Loc />} /></Routes>
                </ToastProvider></AuthProvider>
            </MemoryRouter>)
        await screen.findByLabelText('Name')
        await openAndSubmit()
        expect(await screen.findByTestId('loc')).toHaveTextContent('/')
    })
})
