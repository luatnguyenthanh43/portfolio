import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }))
})

afterEach(() => {
    cleanup()
})

class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return [] }
}
globalThis.IntersectionObserver = IO
globalThis.ResizeObserver = IO

// jsdom gaps needed by ProseMirror/Tiptap (layout APIs)
const rect = { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON() {} }
Range.prototype.getBoundingClientRect = () => rect
Range.prototype.getClientRects = () => []
Element.prototype.getClientRects = () => []
document.elementFromPoint = () => null
