import { vi } from 'vitest'

export const apiMock = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
}
export const getCsrfCookie = vi.fn()

export function resetApiMock() {
    Object.values(apiMock).forEach(f => f.mockReset().mockResolvedValue({ data: {} }))
    getCsrfCookie.mockReset().mockResolvedValue({})
}

export const apiError = (status, data = {}) => Object.assign(new Error('Request failed'), { response: { status, data } })
