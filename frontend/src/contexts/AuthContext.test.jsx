import { render, screen, act, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { AuthProvider } from '@/contexts/AuthContext'
import { useAuth } from '@/hooks/useAuth'
import { apiMock, getCsrfCookie, apiError, resetApiMock } from '@/test/mockApi'

vi.mock('@/lib/api', async () => {
    const m = await import('@/test/mockApi')
    return { default: m.apiMock, getCsrfCookie: m.getCsrfCookie }
})

let ctx
function Probe() {
    ctx = useAuth()
    const u = ctx.user
    return <div data-testid="s">{u === undefined ? 'loading' : u === null ? 'guest' : u.name}</div>
}
const status = () => screen.getByTestId('s').textContent
const mount = () => render(<AuthProvider><Probe /></AuthProvider>)

describe('AuthContext', () => {
    beforeEach(() => resetApiMock())

    it('is undefined while loading, then holds the user', async () => {
        let resolve
        apiMock.get.mockReturnValue(new Promise(r => { resolve = r }))
        mount()
        expect(status()).toBe('loading')
        await act(async () => resolve({ data: { name: 'Ada' } }))
        expect(status()).toBe('Ada')
        expect(apiMock.get).toHaveBeenCalledWith('/user')
    })

    it('becomes null on 401', async () => {
        apiMock.get.mockRejectedValue(apiError(401))
        mount()
        await waitFor(() => expect(status()).toBe('guest'))
    })

    it('login gets the CSRF cookie first, then posts and stores the user', async () => {
        apiMock.get.mockRejectedValue(apiError(401))
        apiMock.post.mockResolvedValue({ data: { user: { name: 'Bob' } } })
        mount()
        await waitFor(() => expect(status()).toBe('guest'))
        const order = []
        getCsrfCookie.mockImplementation(async () => { order.push('csrf') })
        apiMock.post.mockImplementation(async () => { order.push('post'); return { data: { user: { name: 'Bob' } } } })
        await act(() => ctx.login({ email: 'b@x.io', password: 'pw' }))
        expect(order).toEqual(['csrf', 'post'])
        expect(apiMock.post).toHaveBeenCalledWith('/login', { email: 'b@x.io', password: 'pw' })
        expect(status()).toBe('Bob')
    })

    it('login failure propagates and leaves the user null', async () => {
        apiMock.get.mockRejectedValue(apiError(401))
        mount()
        await waitFor(() => expect(status()).toBe('guest'))
        apiMock.post.mockRejectedValue(apiError(422, { errors: { email: ['bad'] } }))
        await expect(act(() => ctx.login({}))).rejects.toMatchObject({ response: { status: 422 } })
        expect(status()).toBe('guest')
    })

    it('register gets the CSRF cookie then posts /register', async () => {
        apiMock.get.mockRejectedValue(apiError(401))
        mount()
        await waitFor(() => expect(status()).toBe('guest'))
        apiMock.post.mockResolvedValue({ data: { user: { name: 'Cy' } } })
        await act(() => ctx.register({ name: 'Cy' }))
        expect(getCsrfCookie).toHaveBeenCalledTimes(1)
        expect(getCsrfCookie.mock.invocationCallOrder[0]).toBeLessThan(apiMock.post.mock.invocationCallOrder[0])
        expect(apiMock.post).toHaveBeenCalledWith('/register', { name: 'Cy' })
        expect(status()).toBe('Cy')
    })

    it('logout posts /logout and clears the user', async () => {
        apiMock.get.mockResolvedValue({ data: { name: 'Ada' } })
        mount()
        await waitFor(() => expect(status()).toBe('Ada'))
        await act(() => ctx.logout())
        expect(apiMock.post).toHaveBeenCalledWith('/logout')
        expect(status()).toBe('guest')
    })

    // BUG (a)/(b): if the session is already gone, /logout returns 401 and logout() throws
    // without clearing the user. Correct behaviour: clear local user regardless.
    it('BUG(a/b): logout clears the user even when /logout returns 401', async () => {
        apiMock.get.mockResolvedValue({ data: { name: 'Ada' } })
        mount()
        await waitFor(() => expect(status()).toBe('Ada'))
        apiMock.post.mockRejectedValue(apiError(401))
        await act(async () => { await ctx.logout().catch(() => {}) })
        expect(status()).toBe('guest')
    })
})
