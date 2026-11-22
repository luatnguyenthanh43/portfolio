import { vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/hooks/useAuth'
import { ToastProvider } from '@/contexts/ToastContext'

/**
 * Renders with MemoryRouter + ToastProvider and a mocked auth value.
 * `user`: undefined (loading) | null (guest) | object. Pass `auth` to override login/logout etc.
 */
export function renderWithProviders(ui, { route = '/', user = null, auth = {} } = {}) {
    const value = {
        user,
        setUser: vi.fn(),
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn().mockResolvedValue(undefined),
        ...auth,
    }
    const result = render(
        <MemoryRouter initialEntries={[route]}>
            <AuthContext.Provider value={value}>
                <ToastProvider>{ui}</ToastProvider>
            </AuthContext.Provider>
        </MemoryRouter>,
    )
    return { ...result, auth: value }
}
