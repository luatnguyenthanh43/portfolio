import { vi } from 'vitest'
import axios from 'axios'
import api, { getCsrfCookie } from '@/lib/api'

describe('lib/api', () => {
    it('is configured for the Sanctum cookie flow', () => {
        expect(api.defaults.baseURL).toBe('/api')
        expect(api.defaults.withCredentials).toBe(true)
        expect(api.defaults.withXSRFToken).toBe(true)
        expect(api.defaults.headers.Accept).toBe('application/json')
    })

    it('getCsrfCookie requests /sanctum/csrf-cookie with credentials', async () => {
        const spy = vi.spyOn(axios, 'get').mockResolvedValue({})
        await getCsrfCookie()
        expect(spy).toHaveBeenCalledWith('/sanctum/csrf-cookie', { withCredentials: true })
        spy.mockRestore()
    })

    // BUG (b): no response interceptor handles 401/419 (expired session / CSRF mismatch).
    it.todo('BUG(b): a 401/419 response on an authenticated request should clear the user / redirect to /login')
})
