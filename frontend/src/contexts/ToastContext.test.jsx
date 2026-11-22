import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ToastProvider } from '@/contexts/ToastContext'
import { useToast } from '@/hooks/useToast'

function Trigger({ opts }) {
    const toast = useToast()
    return <button onClick={() => toast(opts)}>fire</button>
}

describe('ToastContext', () => {
    afterEach(() => vi.useRealTimers())

    it('shows a toast and auto-dismisses after the default 3s', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true })
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
        render(<ToastProvider><Trigger opts={{ message: 'Saved!' }} /></ToastProvider>)
        await user.click(screen.getByRole('button', { name: 'fire' }))
        expect(screen.getByText('Saved!')).toBeInTheDocument()
        act(() => { vi.advanceTimersByTime(2900) })
        expect(screen.getByText('Saved!')).toBeInTheDocument()
        act(() => { vi.advanceTimersByTime(200) })
        expect(screen.queryByText('Saved!')).not.toBeInTheDocument()
    })

    it('honours a custom duration', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true })
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
        render(<ToastProvider><Trigger opts={{ message: 'Quick', duration: 500 }} /></ToastProvider>)
        await user.click(screen.getByRole('button', { name: 'fire' }))
        act(() => { vi.advanceTimersByTime(600) })
        expect(screen.queryByText('Quick')).not.toBeInTheDocument()
    })

    it('dismisses manually via the Dismiss button', async () => {
        const user = userEvent.setup()
        render(<ToastProvider><Trigger opts={{ message: 'Bye', type: 'error' }} /></ToastProvider>)
        await user.click(screen.getByRole('button', { name: 'fire' }))
        await user.click(screen.getByRole('button', { name: 'Dismiss' }))
        expect(screen.queryByText('Bye')).not.toBeInTheDocument()
    })

    it('stacks multiple toasts and dismisses only the chosen one', async () => {
        const user = userEvent.setup()
        function Two() {
            const toast = useToast()
            return <button onClick={() => { toast({ message: 'one' }); toast({ message: 'two' }) }}>fire</button>
        }
        render(<ToastProvider><Two /></ToastProvider>)
        await user.click(screen.getByRole('button', { name: 'fire' }))
        await user.click(screen.getAllByRole('button', { name: 'Dismiss' })[0])
        expect(screen.queryByText('one')).not.toBeInTheDocument()
        expect(screen.getByText('two')).toBeInTheDocument()
    })

    it('renders nothing when there are no toasts', () => {
        const { container } = render(<ToastProvider><span /></ToastProvider>)
        expect(container.querySelector('button')).toBeNull()
    })
})
