import { renderHook, act } from '@testing-library/react'
import useForm from '@/hooks/useForm'

describe('useForm', () => {
    it('sets values', () => {
        const { result } = renderHook(() => useForm({ a: '', b: 1 }))
        act(() => result.current.setData('a', 'x'))
        expect(result.current.data).toEqual({ a: 'x', b: 1 })
    })

    it('resets all or selected keys and clears errors', async () => {
        const { result } = renderHook(() => useForm({ a: '', b: 1 }))
        act(() => { result.current.setData('a', 'x'); result.current.setData('b', 2) })
        await act(() => result.current.submit(() => Promise.reject({ response: { data: { errors: { a: ['bad'] } } } })))
        expect(result.current.errors).toEqual({ a: ['bad'] })
        act(() => result.current.reset('a'))
        expect(result.current.data).toEqual({ a: '', b: 2 })
        expect(result.current.errors).toEqual({})
        act(() => result.current.reset())
        expect(result.current.data).toEqual({ a: '', b: 1 })
    })

    it('submit toggles processing, passes data, and calls onSuccess/onFinish', async () => {
        const { result } = renderHook(() => useForm({ a: 'v' }))
        let release
        const fn = vi.fn(() => new Promise(r => { release = r }))
        const onSuccess = vi.fn(), onFinish = vi.fn(), onError = vi.fn()
        let p
        act(() => { p = result.current.submit(fn, { onSuccess, onFinish, onError }) })
        expect(result.current.processing).toBe(true)
        expect(fn).toHaveBeenCalledWith({ a: 'v' })
        await act(async () => { release('ok'); await p })
        expect(result.current.processing).toBe(false)
        expect(onSuccess).toHaveBeenCalledWith('ok')
        expect(onFinish).toHaveBeenCalled()
        expect(onError).not.toHaveBeenCalled()
    })

    it('submit stores validation errors and calls onError', async () => {
        const { result } = renderHook(() => useForm({}))
        const onError = vi.fn()
        await act(() => result.current.submit(() => Promise.reject({ response: { data: { errors: { x: ['no'] } } } }), { onError }))
        expect(result.current.errors).toEqual({ x: ['no'] })
        expect(onError).toHaveBeenCalled()
        expect(result.current.processing).toBe(false)
    })

    it('submit tolerates errors without a response', async () => {
        const { result } = renderHook(() => useForm({}))
        await act(() => result.current.submit(() => Promise.reject(new Error('net'))))
        expect(result.current.errors).toEqual({})
    })
})
