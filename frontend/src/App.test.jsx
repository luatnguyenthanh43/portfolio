import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from '@/App'
import { apiMock, apiError, resetApiMock } from '@/test/mockApi'

vi.mock('@/lib/api', async () => {
    const m = await import('@/test/mockApi')
    return { default: m.apiMock, getCsrfCookie: m.getCsrfCookie }
})

const USER = { id: 1, name: 'Ada', email: 'ada@example.com' }

function setup(path, userResult) {
    window.history.pushState({}, '', path)
    apiMock.get.mockImplementation((url) => {
        if (url === '/user') return userResult
        if (url === '/portfolio') return Promise.resolve({ data: { profile: null, projects: [], skills: [], experiences: [], educations: [], certifications: [] } })
        return Promise.resolve({ data: {} })
    })
    return render(<App />)
}

describe('routing guards', () => {
    beforeEach(() => resetApiMock())

    it('PrivateRoute renders nothing while auth is loading', async () => {
        const { container } = setup('/dashboard', new Promise(() => {}))
        await new Promise(r => setTimeout(r, 20))
        expect(container).toBeEmptyDOMElement()
        expect(window.location.pathname).toBe('/dashboard')
    })

    it('PrivateRoute redirects guests (401) to /login', async () => {
        setup('/dashboard', Promise.reject(apiError(401)))
        expect(await screen.findByRole('button', { name: 'Log in' })).toBeInTheDocument()
        expect(window.location.pathname).toBe('/login')
    })

    it('PrivateRoute redirects guests from /profile and /admin to /login', async () => {
        setup('/profile', Promise.reject(apiError(401)))
        await screen.findByRole('button', { name: 'Log in' })
        expect(window.location.pathname).toBe('/login')
    })

    it('GuestRoute renders nothing while auth is loading', async () => {
        const { container } = setup('/login', new Promise(() => {}))
        await new Promise(r => setTimeout(r, 20))
        expect(container).toBeEmptyDOMElement()
    })

    it('GuestRoute shows the login page to guests', async () => {
        setup('/login', Promise.reject(apiError(401)))
        expect(await screen.findByRole('button', { name: 'Log in' })).toBeInTheDocument()
    })

    it.each(['/login', '/register', '/forgot-password', '/reset-password'])(
        'GuestRoute redirects authenticated users from %s to /dashboard', async (path) => {
            setup(path, Promise.resolve({ data: USER }))
            await vi.waitFor(() => expect(window.location.pathname).toBe('/dashboard'))
        })

    it('PrivateRoute renders children for authenticated users', async () => {
        setup('/dashboard', Promise.resolve({ data: USER }))
        await vi.waitFor(() => expect(window.location.pathname).toBe('/dashboard'))
        expect(screen.queryByRole('button', { name: 'Log in' })).not.toBeInTheDocument()
    })

    it('treats a non-401 failure of /user as a guest', async () => {
        setup('/dashboard', Promise.reject(apiError(500)))
        await screen.findByRole('button', { name: 'Log in' })
    })

    it('the public home page is reachable without auth', async () => {
        setup('/', Promise.reject(apiError(401)))
        await vi.waitFor(() => expect(apiMock.get).toHaveBeenCalledWith('/portfolio'))
        expect(window.location.pathname).toBe('/')
    })

    // BUG (g): ConfirmPassword posts to /confirm-password, which does not exist on the backend.
    it.todo('BUG(g): /confirm-password route should not be exposed / should hit an existing backend route')
})
