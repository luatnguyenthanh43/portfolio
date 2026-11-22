import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { createRef, useState } from 'react'
import Modal from '@/Components/Modal'
import Dropdown from '@/Components/Dropdown'
import ThemeToggle from '@/Components/ThemeToggle'
import TextInput from '@/Components/TextInput'
import InputError from '@/Components/InputError'
import InputLabel from '@/Components/InputLabel'
import Checkbox from '@/Components/Checkbox'
import PrimaryButton from '@/Components/PrimaryButton'
import SecondaryButton from '@/Components/SecondaryButton'
import DangerButton from '@/Components/DangerButton'

describe('Modal', () => {
    it('renders children only when shown', () => {
        const { rerender } = render(<Modal show={false}><p>content</p></Modal>)
        expect(screen.queryByText('content')).not.toBeInTheDocument()
        rerender(<Modal show><p>content</p></Modal>)
        expect(screen.getByText('content')).toBeInTheDocument()
        expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    it('Escape calls onClose when closeable', async () => {
        const onClose = vi.fn()
        render(<Modal show onClose={onClose}><button>x</button></Modal>)
        await userEvent.keyboard('{Escape}')
        expect(onClose).toHaveBeenCalled()
    })
    it('Escape does nothing when not closeable', async () => {
        const onClose = vi.fn()
        render(<Modal show closeable={false} onClose={onClose}><button>x</button></Modal>)
        await userEvent.keyboard('{Escape}')
        expect(onClose).not.toHaveBeenCalled()
    })
})

describe('Dropdown', () => {
    const ui = (onClick = () => {}) => (
        <MemoryRouter>
            <Dropdown>
                <Dropdown.Trigger><button>Menu</button></Dropdown.Trigger>
                <Dropdown.Content>
                    <Dropdown.Link href="/profile">Profile</Dropdown.Link>
                    <Dropdown.Link onClick={onClick}>Log out</Dropdown.Link>
                </Dropdown.Content>
            </Dropdown>
        </MemoryRouter>
    )
    it('is closed initially and opens on trigger click', async () => {
        render(ui())
        expect(screen.queryByText('Profile')).not.toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: 'Menu' }))
        expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/profile')
    })
    it('onClick link renders a button, fires and closes', async () => {
        const onClick = vi.fn()
        render(ui(onClick))
        await userEvent.click(screen.getByRole('button', { name: 'Menu' }))
        await userEvent.click(screen.getByRole('button', { name: 'Log out' }))
        expect(onClick).toHaveBeenCalled()
        await vi.waitFor(() => expect(screen.queryByText('Log out')).not.toBeInTheDocument())
    })
})

describe('ThemeToggle', () => {
    it('toggles label, html class and storage', async () => {
        render(<ThemeToggle />)
        await userEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
        expect(document.documentElement).toHaveClass('dark')
        expect(localStorage.getItem('theme')).toBe('dark')
        await userEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))
        expect(document.documentElement).not.toHaveClass('dark')
    })
})

describe('inputs and buttons', () => {
    it('InputError renders message or nothing', () => {
        const { rerender, container } = render(<InputError message="Bad" />)
        expect(screen.getByText('Bad')).toBeInTheDocument()
        rerender(<InputError />)
        expect(container).toBeEmptyDOMElement()
    })
    it('InputLabel uses value or children and associates with the input', () => {
        render(<><InputLabel htmlFor="a" value="Name" /><input id="a" /><InputLabel>Child</InputLabel></>)
        expect(screen.getByLabelText('Name')).toBeInTheDocument()
        expect(screen.getByText('Child')).toBeInTheDocument()
    })
    it('TextInput is typeable, defaults to text, forwards focus and isFocused', async () => {
        const ref = createRef()
        function C() { const [v, setV] = useState(''); return <TextInput aria-label="t" value={v} onChange={e => setV(e.target.value)} ref={ref} /> }
        render(<C />)
        const input = screen.getByLabelText('t')
        expect(input).toHaveAttribute('type', 'text')
        await userEvent.type(input, 'hi')
        expect(input).toHaveValue('hi')
        ref.current.focus()
        expect(input).toHaveFocus()
    })
    it('TextInput isFocused autofocuses', () => {
        render(<TextInput aria-label="t" isFocused />)
        expect(screen.getByLabelText('t')).toHaveFocus()
    })
    it('Checkbox toggles', async () => {
        render(<Checkbox aria-label="c" />)
        await userEvent.click(screen.getByRole('checkbox'))
        expect(screen.getByRole('checkbox')).toBeChecked()
    })
    it.each([PrimaryButton, SecondaryButton, DangerButton])('%o buttons click and respect disabled', async (B) => {
        const onClick = vi.fn()
        const { rerender } = render(<B onClick={onClick}>Go</B>)
        await userEvent.click(screen.getByRole('button', { name: 'Go' }))
        expect(onClick).toHaveBeenCalledTimes(1)
        rerender(<B onClick={onClick} disabled>Go</B>)
        expect(screen.getByRole('button', { name: 'Go' })).toBeDisabled()
        await userEvent.click(screen.getByRole('button', { name: 'Go' }))
        expect(onClick).toHaveBeenCalledTimes(1)
    })
})
