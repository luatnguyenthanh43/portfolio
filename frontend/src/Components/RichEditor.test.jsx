import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import RichEditor from '@/Components/RichEditor'

const editable = () => document.querySelector('.ProseMirror')

function Harness({ initial = '', onChange }) {
    const [v, setV] = useState(initial)
    return (
        <>
            <RichEditor value={v} onChange={(h) => { setV(h); onChange?.(h) }} />
            <button onClick={() => setV('<p>external</p>')}>ext</button>
        </>
    )
}

describe('RichEditor', () => {
    it('renders initial HTML', async () => {
        render(<RichEditor value="<p>Hello</p>" onChange={() => {}} />)
        await waitFor(() => expect(editable()).toHaveTextContent('Hello'))
    })

    it('onChange receives HTML when typing', async () => {
        const onChange = vi.fn()
        const user = userEvent.setup()
        render(<RichEditor value="" onChange={onChange} />)
        await waitFor(() => expect(editable()).toBeInTheDocument())
        await user.click(editable())
        await user.keyboard('abc')
        await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('<p>abc</p>'))
    })

    it('Bold button toggles bold (mouse down)', async () => {
        const onChange = vi.fn()
        const user = userEvent.setup()
        render(<RichEditor value="<p>word</p>" onChange={onChange} />)
        await waitFor(() => expect(editable()).toHaveTextContent('word'))
        await user.click(editable())
        await user.keyboard('{Control>}a{/Control}')
        await user.click(screen.getByRole('button', { name: 'B' }))
        await waitFor(() => expect(onChange).toHaveBeenLastCalledWith('<p><strong>word</strong></p>'))
    })

    it.each([
        ['Bullet list', /^<ul><li><p>item<\/p><\/li><\/ul>/],
        ['Ordered list', /^<ol><li><p>item<\/p><\/li><\/ol>/],
    ])('%s button wraps the paragraph in a list', async (title, html) => {
        const onChange = vi.fn()
        const user = userEvent.setup()
        render(<RichEditor value="<p>item</p>" onChange={onChange} />)
        await waitFor(() => expect(editable()).toHaveTextContent('item'))
        await user.click(editable())
        await user.click(screen.getByTitle(title))
        await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(expect.stringMatching(html)))
    })

    it('syncs external value changes', async () => {
        const user = userEvent.setup()
        render(<Harness initial="<p>first</p>" />)
        await waitFor(() => expect(editable()).toHaveTextContent('first'))
        await user.click(screen.getByRole('button', { name: 'ext' }))
        await waitFor(() => expect(editable()).toHaveTextContent('external'))
    })

    // BUG (d): an emptied editor emits '<p></p>' rather than ''. Empty strings are what the
    // backend/Welcome treat as "no content".
    it('BUG(d): emptying the editor calls onChange("")', async () => {
        const onChange = vi.fn()
        const user = userEvent.setup()
        render(<RichEditor value="<p>x</p>" onChange={onChange} />)
        await waitFor(() => expect(editable()).toHaveTextContent('x'))
        await user.click(editable())
        await user.keyboard('{Control>}a{/Control}{Backspace}')
        await waitFor(() => expect(onChange).toHaveBeenCalled())
        expect(onChange).toHaveBeenLastCalledWith('')
    })

    // BUG (d): toolbar buttons only handle onMouseDown, so Enter/Space (click event) do nothing.
    it('BUG(d): toolbar buttons are keyboard-activatable (Enter)', async () => {
        const onChange = vi.fn()
        const user = userEvent.setup()
        render(<RichEditor value="<p>item</p>" onChange={onChange} />)
        await waitFor(() => expect(editable()).toHaveTextContent('item'))
        await user.click(editable())
        screen.getByTitle('Bullet list').focus()
        await user.keyboard('{Enter}')
        await waitFor(() => expect(onChange).toHaveBeenLastCalledWith(expect.stringMatching(/^<ul><li><p>item<\/p><\/li><\/ul>/)))
    })
})
