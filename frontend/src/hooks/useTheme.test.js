import { renderHook, act } from '@testing-library/react'
import useTheme from '@/hooks/useTheme'

const mockPrefersDark = (dark) => {
    window.matchMedia = vi.fn().mockImplementation((q) => ({ matches: dark, media: q }))
}

describe('useTheme', () => {
    it('defaults to light when nothing saved and no dark preference', () => {
        const { result } = renderHook(() => useTheme())
        expect(result.current.theme).toBe('light')
        expect(document.documentElement).not.toHaveClass('dark')
        expect(localStorage.getItem('theme')).toBe('light')
    })

    it('uses prefers-color-scheme: dark when nothing saved', () => {
        mockPrefersDark(true)
        const { result } = renderHook(() => useTheme())
        expect(result.current.theme).toBe('dark')
        expect(document.documentElement).toHaveClass('dark')
    })

    it('saved theme wins over system preference', () => {
        mockPrefersDark(true)
        localStorage.setItem('theme', 'light')
        const { result } = renderHook(() => useTheme())
        expect(result.current.theme).toBe('light')
        expect(document.documentElement).not.toHaveClass('dark')
    })

    it('toggle flips theme, html class and persists', () => {
        const { result } = renderHook(() => useTheme())
        act(() => result.current.toggle())
        expect(result.current.theme).toBe('dark')
        expect(document.documentElement).toHaveClass('dark')
        expect(localStorage.getItem('theme')).toBe('dark')
        act(() => result.current.toggle())
        expect(document.documentElement).not.toHaveClass('dark')
        expect(localStorage.getItem('theme')).toBe('light')
    })
})
