import { renderHook } from '@testing-library/react'
import { AuthContext, useAuth } from '@/hooks/useAuth'
import { ToastContext, useToast } from '@/hooks/useToast'

describe('useAuth / useToast', () => {
    it('useAuth returns the provided context value', () => {
        const value = { user: { id: 1 } }
        const { result } = renderHook(() => useAuth(), { wrapper: ({ children }) => <AuthContext.Provider value={value}>{children}</AuthContext.Provider> })
        expect(result.current).toBe(value)
    })
    it('useAuth is null outside a provider', () => {
        expect(renderHook(() => useAuth()).result.current).toBeNull()
    })
    it('useToast returns the provided function', () => {
        const fn = () => {}
        const { result } = renderHook(() => useToast(), { wrapper: ({ children }) => <ToastContext.Provider value={fn}>{children}</ToastContext.Provider> })
        expect(result.current).toBe(fn)
    })
    it('useToast is null outside a provider', () => {
        expect(renderHook(() => useToast()).result.current).toBeNull()
    })
})
