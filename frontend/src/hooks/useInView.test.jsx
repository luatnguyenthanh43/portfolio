import { render, screen, act } from '@testing-library/react'
import { vi } from 'vitest'
import useInView from '@/hooks/useInView'

let instances
class FakeIO {
    constructor(cb, opts) { this.cb = cb; this.opts = opts; this.observe = vi.fn(); this.disconnect = vi.fn(); instances.push(this) }
}

function Box({ options }) {
    const [ref, inView] = useInView(options)
    return <div ref={ref} data-testid="box">{inView ? 'visible' : 'hidden'}</div>
}

describe('useInView', () => {
    beforeEach(() => { instances = []; vi.stubGlobal('IntersectionObserver', FakeIO) })
    afterEach(() => vi.unstubAllGlobals())

    it('starts hidden and observes the element with default threshold', () => {
        render(<Box />)
        expect(screen.getByTestId('box')).toHaveTextContent('hidden')
        expect(instances[0].observe).toHaveBeenCalledWith(screen.getByTestId('box'))
        expect(instances[0].opts.threshold).toBe(0.12)
    })

    it('merges custom options', () => {
        render(<Box options={{ threshold: 0.5 }} />)
        expect(instances[0].opts.threshold).toBe(0.5)
    })

    it('becomes visible once intersecting and disconnects', () => {
        render(<Box />)
        act(() => instances[0].cb([{ isIntersecting: false }]))
        expect(screen.getByTestId('box')).toHaveTextContent('hidden')
        act(() => instances[0].cb([{ isIntersecting: true }]))
        expect(screen.getByTestId('box')).toHaveTextContent('visible')
        expect(instances[0].disconnect).toHaveBeenCalled()
    })

    it('disconnects on unmount', () => {
        const { unmount } = render(<Box />)
        unmount()
        expect(instances[0].disconnect).toHaveBeenCalled()
    })
})
