import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

const btnCls = (active) =>
    `px-2 py-1 rounded text-xs font-medium transition-colors ${
        active
            ? 'bg-violet-600 text-white'
            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
    }`

function ToolbarBtn({ onClick, active = false, title, children }) {
    return (
        <button type="button" onMouseDown={e => { e.preventDefault(); onClick() }} className={btnCls(active)} title={title}>
            {children}
        </button>
    )
}

export default function RichEditor({ value, onChange, placeholder = 'Write something…' }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({ openOnClick: false }),
            Placeholder.configure({ placeholder }),
        ],
        content: value || '',
        onUpdate({ editor }) {
            onChange(editor.getHTML())
        },
    })

    // sync external value changes (e.g. on reset)
    useEffect(() => {
        if (!editor) return
        if (editor.getHTML() !== value) {
            editor.commands.setContent(value || '', false)
        }
    }, [value])

    const setLink = () => {
        const url = window.prompt('URL', editor.getAttributes('link').href || 'https://')
        if (url === null) return
        if (url === '') { editor.chain().focus().unsetLink().run(); return }
        editor.chain().focus().setLink({ href: url }).run()
    }

    if (!editor) return null

    return (
        <div className="rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800">
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
                    <strong>B</strong>
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
                    <em>I</em>
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
                    <span className="underline">U</span>
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
                    <span className="line-through">S</span>
                </ToolbarBtn>

                <span className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />

                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
                    H2
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
                    H3
                </ToolbarBtn>

                <span className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />

                <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
                    ≡
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list">
                    1.
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
                    "
                </ToolbarBtn>

                <span className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />

                <ToolbarBtn onClick={setLink} active={editor.isActive('link')} title="Link">
                    🔗
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
                    {'<>'}
                </ToolbarBtn>

                <span className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />

                <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">↩</ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">↪</ToolbarBtn>
            </div>

            {/* Editor area */}
            <EditorContent
                editor={editor}
                className="rich-editor min-h-[140px] bg-white px-3 py-2 text-sm text-gray-900 dark:bg-gray-700 dark:text-gray-100"
            />
        </div>
    )
}
