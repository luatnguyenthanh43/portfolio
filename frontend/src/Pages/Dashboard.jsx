import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import RichEditor from '@/Components/RichEditor'
import { useToast } from '@/hooks/useToast'
import api from '@/lib/api'
import { useEffect, useRef, useState } from 'react'

// ── Date helpers (date picker ↔ display) ──────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function toDateInput(val) {
    if (!val) return ''
    // already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val
    // YYYY-MM (old month-only format) → YYYY-MM-01
    if (/^\d{4}-\d{2}$/.test(val)) return `${val}-01`
    // "Jan 15, 2022" → 2022-01-15
    const mDay = val.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/)
    if (mDay) {
        const idx = MONTHS.findIndex(n => n.toLowerCase() === mDay[1].toLowerCase())
        if (idx >= 0) return `${mDay[3]}-${String(idx + 1).padStart(2, '0')}-${String(mDay[2]).padStart(2, '0')}`
    }
    // "Jan 2022" → 2022-01-01
    const mMonth = val.match(/^([A-Za-z]+)\s+(\d{4})$/)
    if (mMonth) {
        const idx = MONTHS.findIndex(n => n.toLowerCase() === mMonth[1].toLowerCase())
        if (idx >= 0) return `${mMonth[2]}-${String(idx + 1).padStart(2, '0')}-01`
    }
    return ''
}

function fmtDate(val) {
    if (!val) return ''
    // YYYY-MM-DD → "Jan 15, 2022"
    const m = val.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (m) {
        const month = MONTHS[parseInt(m[2]) - 1]
        const day = parseInt(m[3])
        return day === 1 ? `${month} ${m[1]}` : `${month} ${day}, ${m[1]}`
    }
    // fallback: old "Jan 2022" style
    return val
}

// keep old aliases so nothing breaks
const toMonthInput = toDateInput
const fmtMonth = fmtDate

// ─── Shared helpers ────────────────────────────────────────────────────────────

const inputCls = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
const btnPrimary = 'rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition'
const btnSecondary = 'rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition'
const btnDanger = 'rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition'
const btnEdit = 'rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition'

function Field({ label, children }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            {children}
        </div>
    )
}

// ─── Profile Tab ───────────────────────────────────────────────────────────────

const emptyProfile = { name: '', title: '', bio: '', email: '', phone: '', location: '', github_url: '', linkedin_url: '' }

function ProfileTab() {
    const toast = useToast()
    const [form, setForm] = useState(emptyProfile)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        api.get('/portfolio').then(r => {
            if (r.data.profile) setForm({ ...emptyProfile, ...r.data.profile })
        })
    }, [])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const submit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.put('/portfolio/profile', form)
            toast({ message: 'Profile saved successfully.' })
        } catch {
            toast({ message: 'Failed to save profile.', type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={submit} className="max-w-2xl space-y-4">
            <Field label="Name"><input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} required /></Field>
            <Field label="Title"><input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} required /></Field>
            <Field label="Bio">
                <RichEditor value={form.bio} onChange={v => set('bio', v)} placeholder="Write your bio…" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email"><input className={inputCls} type="email" value={form.email} onChange={e => set('email', e.target.value)} /></Field>
                <Field label="Phone"><input className={inputCls} type="tel" placeholder="+84 123 456 789" value={form.phone} onChange={e => set('phone', e.target.value)} /></Field>
            </div>
            <Field label="Location"><input className={inputCls} placeholder="e.g. Ho Chi Minh City, Vietnam" value={form.location} onChange={e => set('location', e.target.value)} /></Field>
            <Field label="GitHub URL"><input className={inputCls} value={form.github_url} onChange={e => set('github_url', e.target.value)} /></Field>
            <Field label="LinkedIn URL"><input className={inputCls} value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} /></Field>
            <button type="submit" className={btnPrimary} disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</button>
        </form>
    )
}

// ─── Projects Tab ──────────────────────────────────────────────────────────────

const emptyProject = { title: '', description: '', tech_stack: [], image_url: '', demo_url: '', github_url: '', status: 'Completed', featured: false, category: '', year: '', order: 0 }

const PROJECT_STATUSES = ['Completed', 'In Progress', 'Archived']
const PROJECT_CATEGORIES = ['Web', 'Mobile', 'API', 'CLI', 'Library', 'Other']

function ProjectForm({ initial, onSave, onCancel }) {
    const [form, setForm] = useState({
        ...emptyProject,
        ...initial,
        tech_stack: Array.isArray(initial?.tech_stack) ? initial.tech_stack : [],
    })
    const [saving, setSaving] = useState(false)
    const [techInput, setTechInput] = useState('')
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const addTech = () => {
        const t = techInput.trim()
        if (t && !form.tech_stack.includes(t)) set('tech_stack', [...form.tech_stack, t])
        setTechInput('')
    }
    const removeTech = (t) => set('tech_stack', form.tech_stack.filter(x => x !== t))

    const submit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try { await onSave(form) } finally { setSaving(false) }
    }

    return (
        <form onSubmit={submit} className="rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-800 dark:bg-violet-950">
            <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Title *"><input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} required /></Field>
                <Field label="Category">
                    <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
                        <option value="">— Select —</option>
                        {PROJECT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </Field>
                <Field label="Status">
                    <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                        {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </Field>
                <Field label="Year"><input className={inputCls} placeholder="e.g. 2024" value={form.year} onChange={e => set('year', e.target.value)} /></Field>
                <div className="sm:col-span-2">
                    <Field label="Description">
                        <RichEditor value={form.description} onChange={v => set('description', v)} placeholder="Describe this…" />
                    </Field>
                </div>
                <Field label="Demo URL"><input className={inputCls} value={form.demo_url} onChange={e => set('demo_url', e.target.value)} /></Field>
                <Field label="GitHub URL"><input className={inputCls} value={form.github_url} onChange={e => set('github_url', e.target.value)} /></Field>
                <Field label="Image URL"><input className={inputCls} value={form.image_url} onChange={e => set('image_url', e.target.value)} /></Field>
                <Field label="Order"><input className={inputCls} type="number" value={form.order} onChange={e => set('order', parseInt(e.target.value) || 0)} /></Field>
                <div className="sm:col-span-2">
                    <Field label="Tech Stack (press Enter to add)">
                        <input
                            className={inputCls}
                            placeholder="e.g. React"
                            value={techInput}
                            onChange={e => setTechInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech() } }}
                        />
                        {form.tech_stack.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {form.tech_stack.map(t => (
                                    <span key={t} className="flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                                        {t}
                                        <button type="button" onClick={() => removeTech(t)} className="hover:text-red-500">✕</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </Field>
                </div>
                <div className="sm:col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="featured" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="h-4 w-4 accent-violet-600" />
                    <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300">Featured project</label>
                </div>
            </div>
            <div className="mt-3 flex gap-2">
                <button type="submit" className={btnPrimary} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                <button type="button" className={btnSecondary} onClick={onCancel}>Cancel</button>
            </div>
        </form>
    )
}

function ProjectsTab() {
    const toast = useToast()
    const [items, setItems] = useState([])
    const [adding, setAdding] = useState(false)
    const [editId, setEditId] = useState(null)

    const load = () => api.get('/portfolio').then(r => setItems(r.data.projects || []))
    useEffect(() => { load() }, [])

    const handleAdd = async (payload) => {
        try {
            await api.post('/portfolio/projects', payload)
            setAdding(false)
            load()
            toast({ message: 'Project added.' })
        } catch { toast({ message: 'Failed to add project.', type: 'error' }) }
    }

    const handleUpdate = async (id, payload) => {
        try {
            await api.put(`/portfolio/projects/${id}`, payload)
            setEditId(null)
            load()
            toast({ message: 'Project updated.' })
        } catch { toast({ message: 'Failed to update project.', type: 'error' }) }
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this project?')) return
        try {
            await api.delete(`/portfolio/projects/${id}`)
            load()
            toast({ message: 'Project deleted.' })
        } catch { toast({ message: 'Failed to delete project.', type: 'error' }) }
    }

    return (
        <div className="space-y-4">
            {!adding && <button className={btnPrimary} onClick={() => setAdding(true)}>+ Add Project</button>}
            {adding && <ProjectForm initial={emptyProject} onSave={handleAdd} onCancel={() => setAdding(false)} />}
            <div className="space-y-3">
                {items.map(item => editId === item.id ? (
                    <ProjectForm key={item.id} initial={item} onSave={p => handleUpdate(item.id, p)} onCancel={() => setEditId(null)} />
                ) : (
                    <div key={item.id} className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                            {item.description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{item.description}</p>}
                            {item.tech_stack?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {item.tech_stack.map(t => <span key={t} className="rounded bg-violet-100 px-2 py-0.5 text-xs text-violet-700 dark:bg-violet-900 dark:text-violet-300">{t}</span>)}
                                </div>
                            )}
                        </div>
                        <div className="ml-4 flex shrink-0 gap-2">
                            <button className={btnEdit} onClick={() => setEditId(item.id)}>Edit</button>
                            <button className={btnDanger} onClick={() => handleDelete(item.id)}>Delete</button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No projects yet.</p>}
            </div>
        </div>
    )
}

// ─── Skills Tab ────────────────────────────────────────────────────────────────

const emptySkill = { name: '', category: '', level: 80, order: 0 }

function SkillForm({ initial, onSave, onCancel }) {
    const [form, setForm] = useState({ ...emptySkill, ...initial })
    const [saving, setSaving] = useState(false)
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const submit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try { await onSave(form) } finally { setSaving(false) }
    }

    return (
        <form onSubmit={submit} className="rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-800 dark:bg-violet-950">
            <div className="grid gap-3 sm:grid-cols-4">
                <Field label="Name *"><input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} required /></Field>
                <Field label="Category"><input className={inputCls} value={form.category} onChange={e => set('category', e.target.value)} placeholder="Frontend" /></Field>
                <Field label="Level (0–100)"><input className={inputCls} type="number" min={0} max={100} value={form.level} onChange={e => set('level', parseInt(e.target.value) || 0)} /></Field>
                <Field label="Order"><input className={inputCls} type="number" value={form.order} onChange={e => set('order', parseInt(e.target.value) || 0)} /></Field>
            </div>
            <div className="mt-3 flex gap-2">
                <button type="submit" className={btnPrimary} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                <button type="button" className={btnSecondary} onClick={onCancel}>Cancel</button>
            </div>
        </form>
    )
}

function SkillsTab() {
    const toast = useToast()
    const [items, setItems] = useState([])
    const [adding, setAdding] = useState(false)
    const [editId, setEditId] = useState(null)
    const dragIdx = useRef(null)
    const [dragOver, setDragOver] = useState(null)

    const load = () => api.get('/portfolio').then(r => setItems(r.data.skills || []))
    useEffect(() => { load() }, [])

    const handleAdd = async (payload) => {
        try { await api.post('/portfolio/skills', payload); setAdding(false); load(); toast({ message: 'Skill added.' }) }
        catch { toast({ message: 'Failed to add skill.', type: 'error' }) }
    }
    const handleUpdate = async (id, payload) => {
        try { await api.put(`/portfolio/skills/${id}`, payload); setEditId(null); load(); toast({ message: 'Skill updated.' }) }
        catch { toast({ message: 'Failed to update skill.', type: 'error' }) }
    }
    const handleDelete = async (id) => {
        if (!confirm('Delete this skill?')) return
        try { await api.delete(`/portfolio/skills/${id}`); load(); toast({ message: 'Skill deleted.' }) }
        catch { toast({ message: 'Failed to delete skill.', type: 'error' }) }
    }

    const handleDragStart = (i) => { dragIdx.current = i }
    const handleDragOver = (e, i) => { e.preventDefault(); setDragOver(i) }
    const handleDragEnd = () => { setDragOver(null); dragIdx.current = null }
    const handleDrop = async (i) => {
        const from = dragIdx.current
        setDragOver(null); dragIdx.current = null
        if (from === null || from === i) return
        const next = [...items]
        const [moved] = next.splice(from, 1)
        next.splice(i, 0, moved)
        const reordered = next.map((item, idx) => ({ ...item, order: idx }))
        setItems(reordered)
        try {
            await api.post('/portfolio/skills/reorder', { items: reordered.map(({ id, order }) => ({ id, order })) })
            toast({ message: 'Order saved.' })
        } catch { toast({ message: 'Failed to save order.', type: 'error' }); load() }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                {!adding && <button className={btnPrimary} onClick={() => setAdding(true)}>+ Add Skill</button>}
                {items.length > 1 && <span className="text-xs text-gray-400 dark:text-gray-500">Drag to reorder</span>}
            </div>
            {adding && <SkillForm initial={emptySkill} onSave={handleAdd} onCancel={() => setAdding(false)} />}
            <div className="space-y-2">
                {items.map((item, i) => (
                    <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragOver={e => handleDragOver(e, i)}
                        onDragEnd={handleDragEnd}
                        onDrop={() => handleDrop(i)}
                        className={`rounded-lg border bg-white p-3 dark:bg-gray-800 transition-colors ${dragOver === i ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                        {editId === item.id ? (
                            <SkillForm initial={item} onSave={p => handleUpdate(item.id, p)} onCancel={() => setEditId(null)} />
                        ) : (
                            <div className="flex items-center gap-3">
                                <span className="cursor-grab text-gray-300 dark:text-gray-600 hover:text-gray-400"><GripIcon /></span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="font-medium text-gray-900 dark:text-white truncate">{item.name}</span>
                                            {item.category && (
                                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400 shrink-0">{item.category}</span>
                                            )}
                                        </div>
                                        <span className="text-xs font-mono text-violet-600 dark:text-violet-400 shrink-0">{item.level}%</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                        <div className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all" style={{ width: `${item.level}%` }} />
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button className={btnEdit} onClick={() => setEditId(item.id)}>Edit</button>
                                    <button className={btnDanger} onClick={() => handleDelete(item.id)}>Del</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {items.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No skills yet.</p>}
            </div>
        </div>
    )
}

// ─── Experience Tab ────────────────────────────────────────────────────────────

const emptyExp = { company: '', role: '', start_date: '', end_date: '', description: '', location: '', employment_type: '', tech_stack: [], key_achievements: [], order: 0 }

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Freelance', 'Internship', 'Contract', 'Remote']

const COMMON_TECHS = [
    'JavaScript', 'TypeScript', 'Python', 'PHP', 'Java', 'Go', 'Rust', 'C#', 'C++', 'Ruby',
    'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte',
    'Node.js', 'Laravel', 'Django', 'FastAPI', 'Spring Boot', 'Express', 'NestJS',
    'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Redis', 'Elasticsearch',
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD', 'Linux',
    'GraphQL', 'REST API', 'WebSocket', 'Microservices',
    'Tailwind CSS', 'Bootstrap', 'Sass', 'HTML', 'CSS',
    'Git', 'GitHub', 'GitLab', 'Jira', 'Figma',
]

function TechPicker({ selected, onChange }) {
    const [custom, setCustom] = useState('')
    const toggle = (tech) => {
        if (selected.includes(tech)) onChange(selected.filter(t => t !== tech))
        else onChange([...selected, tech])
    }
    const addCustom = () => {
        const t = custom.trim()
        if (t && !selected.includes(t)) onChange([...selected, t])
        setCustom('')
    }
    return (
        <div className="space-y-2">
            {/* Selected chips */}
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selected.map(t => (
                        <button
                            key={t} type="button"
                            onClick={() => toggle(t)}
                            className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors bg-violet-600 text-white hover:bg-violet-700"
                        >
                            {t} <span className="opacity-70">✕</span>
                        </button>
                    ))}
                </div>
            )}
            {/* Common options */}
            <div className="flex flex-wrap gap-1.5 rounded-md border border-gray-200 bg-gray-50 p-2.5 dark:border-gray-600 dark:bg-gray-800">
                {COMMON_TECHS.filter(t => !selected.includes(t)).map(t => (
                    <button
                        key={t} type="button"
                        onClick={() => toggle(t)}
                        className="rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-600 transition-colors hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-violet-500 dark:hover:text-violet-400"
                    >
                        + {t}
                    </button>
                ))}
            </div>
            {/* Custom entry */}
            <div className="flex gap-2">
                <input
                    className={inputCls}
                    placeholder="Add custom tech…"
                    value={custom}
                    onChange={e => setCustom(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
                />
                <button type="button" onClick={addCustom} className={btnSecondary + ' shrink-0'}>Add</button>
            </div>
        </div>
    )
}

function ExpForm({ initial, onSave, onCancel }) {
    const [form, setForm] = useState({
        ...emptyExp,
        ...initial,
        start_date: toMonthInput(initial?.start_date || ''),
        end_date: toMonthInput(initial?.end_date || ''),
        tech_stack: initial?.tech_stack || [],
        key_achievements: initial?.key_achievements || [],
    })
    const [saving, setSaving] = useState(false)
    const [achieveInput, setAchieveInput] = useState('')
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const addAchievement = () => {
        const a = achieveInput.trim()
        if (a) set('key_achievements', [...form.key_achievements, a])
        setAchieveInput('')
    }
    const removeAchievement = (i) => set('key_achievements', form.key_achievements.filter((_, idx) => idx !== i))

    const submit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await onSave({ ...form, start_date: fmtMonth(form.start_date), end_date: fmtMonth(form.end_date) })
        } finally { setSaving(false) }
    }

    return (
        <form onSubmit={submit} className="rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-800 dark:bg-violet-950">
            <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Company *"><input className={inputCls} value={form.company} onChange={e => set('company', e.target.value)} required /></Field>
                <Field label="Role *"><input className={inputCls} value={form.role} onChange={e => set('role', e.target.value)} required /></Field>
                <Field label="Start Date *">
                    <input className={inputCls} type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} required />
                </Field>
                <Field label="End Date (blank = Present)">
                    <input className={inputCls} type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
                    {form.end_date && (
                        <button type="button" onClick={() => set('end_date', '')} className="mt-1 text-xs text-gray-400 hover:text-red-500">
                            ✕ Clear (set to Present)
                        </button>
                    )}
                </Field>
                <Field label="Location">
                    <input className={inputCls} placeholder="e.g. Ho Chi Minh City / Remote" value={form.location} onChange={e => set('location', e.target.value)} />
                </Field>
                <Field label="Employment Type">
                    <select className={inputCls} value={form.employment_type} onChange={e => set('employment_type', e.target.value)}>
                        <option value="">— Select —</option>
                        {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </Field>
                <div className="sm:col-span-2">
                    <Field label="Description">
                        <RichEditor value={form.description} onChange={v => set('description', v)} placeholder="Describe this…" />
                    </Field>
                </div>
                <div className="sm:col-span-2">
                    <Field label="Tech Stack">
                        <TechPicker selected={form.tech_stack} onChange={v => set('tech_stack', v)} />
                    </Field>
                </div>
                <div className="sm:col-span-2">
                    <Field label="Key Achievements (press Enter to add)">
                        <input
                            className={inputCls}
                            placeholder="e.g. Reduced API response time by 40%"
                            value={achieveInput}
                            onChange={e => setAchieveInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAchievement() } }}
                        />
                        {form.key_achievements.length > 0 && (
                            <ul className="mt-2 space-y-1">
                                {form.key_achievements.map((a, i) => (
                                    <li key={i} className="flex items-start gap-2 rounded-md bg-green-50 px-3 py-1.5 text-sm dark:bg-green-900/20">
                                        <span className="mt-0.5 text-green-500">✦</span>
                                        <span className="flex-1 text-gray-700 dark:text-gray-300">{a}</span>
                                        <button type="button" onClick={() => removeAchievement(i)} className="text-gray-400 hover:text-red-500">✕</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Field>
                </div>
            </div>
            <div className="mt-3 flex gap-2">
                <button type="submit" className={btnPrimary} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                <button type="button" className={btnSecondary} onClick={onCancel}>Cancel</button>
            </div>
        </form>
    )
}

// drag handle icon
function GripIcon() {
    return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM5.5 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-5 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
        </svg>
    )
}

function ExperienceTab() {
    const toast = useToast()
    const [items, setItems] = useState([])
    const [adding, setAdding] = useState(false)
    const [editId, setEditId] = useState(null)
    const [dragOver, setDragOver] = useState(null)
    const dragIdx = useRef(null)

    const load = () => api.get('/portfolio').then(r => setItems(r.data.experiences || []))
    useEffect(() => { load() }, [])

    const handleAdd = async (payload) => {
        try { await api.post('/portfolio/experiences', payload); setAdding(false); load(); toast({ message: 'Experience added.' }) }
        catch { toast({ message: 'Failed to add experience.', type: 'error' }) }
    }
    const handleUpdate = async (id, payload) => {
        try { await api.put(`/portfolio/experiences/${id}`, payload); setEditId(null); load(); toast({ message: 'Experience updated.' }) }
        catch { toast({ message: 'Failed to update experience.', type: 'error' }) }
    }
    const handleDelete = async (id) => {
        if (!confirm('Delete this experience?')) return
        try { await api.delete(`/portfolio/experiences/${id}`); load(); toast({ message: 'Experience deleted.' }) }
        catch { toast({ message: 'Failed to delete experience.', type: 'error' }) }
    }

    // ── drag-and-drop ──────────────────────────────────────────────────────────
    const handleDragStart = (i) => { dragIdx.current = i }
    const handleDragOver = (e, i) => { e.preventDefault(); setDragOver(i) }
    const handleDragEnd = () => { setDragOver(null); dragIdx.current = null }

    const handleDrop = async (i) => {
        const from = dragIdx.current
        setDragOver(null)
        dragIdx.current = null
        if (from === null || from === i) return
        const next = [...items]
        const [moved] = next.splice(from, 1)
        next.splice(i, 0, moved)
        const reordered = next.map((item, idx) => ({ ...item, order: idx }))
        setItems(reordered)
        try {
            await api.post('/portfolio/experiences/reorder', { items: reordered.map(({ id, order }) => ({ id, order })) })
            toast({ message: 'Order saved.' })
        } catch {
            toast({ message: 'Failed to save order.', type: 'error' })
            load()
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                {!adding && <button className={btnPrimary} onClick={() => setAdding(true)}>+ Add Experience</button>}
                {items.length > 1 && !adding && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">Drag rows to reorder</span>
                )}
            </div>
            {adding && <ExpForm initial={emptyExp} onSave={handleAdd} onCancel={() => setAdding(false)} />}
            <div className="space-y-2">
                {items.map((item, i) => editId === item.id ? (
                    <ExpForm key={item.id} initial={item} onSave={p => handleUpdate(item.id, p)} onCancel={() => setEditId(null)} />
                ) : (
                    <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragOver={(e) => handleDragOver(e, i)}
                        onDrop={() => handleDrop(i)}
                        onDragEnd={handleDragEnd}
                        className={`flex cursor-grab items-start rounded-lg border bg-white p-4 transition-all active:cursor-grabbing dark:bg-gray-800 ${
                            dragOver === i
                                ? 'border-violet-400 shadow-md shadow-violet-100 dark:border-violet-500 dark:shadow-violet-900/50'
                                : 'border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        {/* grip handle */}
                        <div className="mr-3 mt-1 shrink-0 text-gray-300 dark:text-gray-600">
                            <GripIcon />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                                {item.role} <span className="font-normal text-violet-600 dark:text-violet-400">@ {item.company}</span>
                            </p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {fmtMonth(item.start_date)} — {item.end_date ? fmtMonth(item.end_date) : 'Present'}
                            </p>
                            {item.description && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>}
                        </div>
                        <div className="ml-4 flex shrink-0 gap-2">
                            <button className={btnEdit} onClick={() => setEditId(item.id)}>Edit</button>
                            <button className={btnDanger} onClick={() => handleDelete(item.id)}>Delete</button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No experiences yet.</p>}
            </div>
        </div>
    )
}

// ─── Education Tab ─────────────────────────────────────────────────────────────

const emptyEdu = { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', description: '', gpa: '', order: 0 }

function EduForm({ initial, onSave, onCancel }) {
    const [form, setForm] = useState({
        ...emptyEdu,
        ...initial,
        start_date: toMonthInput(initial?.start_date || ''),
        end_date: toMonthInput(initial?.end_date || ''),
    })
    const [saving, setSaving] = useState(false)
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const submit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await onSave({ ...form, start_date: fmtMonth(form.start_date), end_date: fmtMonth(form.end_date) })
        } finally { setSaving(false) }
    }

    return (
        <form onSubmit={submit} className="rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-800 dark:bg-violet-950">
            <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Institution *"><input className={inputCls} value={form.institution} onChange={e => set('institution', e.target.value)} required placeholder="e.g. University of Technology" /></Field>
                <Field label="Degree"><input className={inputCls} value={form.degree} onChange={e => set('degree', e.target.value)} placeholder="e.g. Bachelor of Science" /></Field>
                <Field label="Field of Study"><input className={inputCls} value={form.field_of_study} onChange={e => set('field_of_study', e.target.value)} placeholder="e.g. Computer Science" /></Field>
                <Field label="GPA"><input className={inputCls} value={form.gpa} onChange={e => set('gpa', e.target.value)} placeholder="e.g. 3.8 / 4.0" /></Field>
                <Field label="Start Date">
                    <input className={inputCls} type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
                </Field>
                <Field label="End Date (blank = Present)">
                    <input className={inputCls} type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
                    {form.end_date && (
                        <button type="button" onClick={() => set('end_date', '')} className="mt-1 text-xs text-gray-400 hover:text-red-500">✕ Clear (set to Present)</button>
                    )}
                </Field>
                <div className="sm:col-span-2">
                    <Field label="Description">
                        <RichEditor value={form.description} onChange={v => set('description', v)} placeholder="Activities, achievements, notes…" />
                    </Field>
                </div>
            </div>
            <div className="mt-3 flex gap-2">
                <button type="submit" className={btnPrimary} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                <button type="button" className={btnSecondary} onClick={onCancel}>Cancel</button>
            </div>
        </form>
    )
}

function EducationTab() {
    const toast = useToast()
    const [items, setItems] = useState([])
    const [adding, setAdding] = useState(false)
    const [editId, setEditId] = useState(null)
    const dragIdx = useRef(null)
    const [dragOver, setDragOver] = useState(null)

    const load = () => api.get('/portfolio').then(r => setItems(r.data.educations || []))
    useEffect(() => { load() }, [])

    const handleAdd = async (payload) => {
        try { await api.post('/portfolio/educations', payload); setAdding(false); load(); toast({ message: 'Education added.' }) }
        catch { toast({ message: 'Failed to add education.', type: 'error' }) }
    }
    const handleUpdate = async (id, payload) => {
        try { await api.put(`/portfolio/educations/${id}`, payload); setEditId(null); load(); toast({ message: 'Education updated.' }) }
        catch { toast({ message: 'Failed to update education.', type: 'error' }) }
    }
    const handleDelete = async (id) => {
        if (!confirm('Delete this education?')) return
        try { await api.delete(`/portfolio/educations/${id}`); load(); toast({ message: 'Education deleted.' }) }
        catch { toast({ message: 'Failed to delete education.', type: 'error' }) }
    }

    const handleDragStart = (i) => { dragIdx.current = i }
    const handleDragOver = (e, i) => { e.preventDefault(); setDragOver(i) }
    const handleDragEnd = () => { setDragOver(null); dragIdx.current = null }
    const handleDrop = async (i) => {
        const from = dragIdx.current
        setDragOver(null); dragIdx.current = null
        if (from === null || from === i) return
        const next = [...items]
        const [moved] = next.splice(from, 1)
        next.splice(i, 0, moved)
        const reordered = next.map((item, idx) => ({ ...item, order: idx }))
        setItems(reordered)
        try {
            await api.post('/portfolio/educations/reorder', { items: reordered.map(({ id, order }) => ({ id, order })) })
            toast({ message: 'Order saved.' })
        } catch { toast({ message: 'Failed to save order.', type: 'error' }); load() }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                {!adding && <button className={btnPrimary} onClick={() => setAdding(true)}>+ Add Education</button>}
            </div>
            {adding && <EduForm initial={emptyEdu} onSave={handleAdd} onCancel={() => setAdding(false)} />}
            <div className="space-y-3">
                {items.map((item, i) => (
                    <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragOver={e => handleDragOver(e, i)}
                        onDragEnd={handleDragEnd}
                        onDrop={() => handleDrop(i)}
                        className={`rounded-lg border bg-white p-4 dark:bg-gray-800 transition-colors ${dragOver === i ? 'border-violet-400' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                        {editId === item.id ? (
                            <EduForm initial={item} onSave={p => handleUpdate(item.id, p)} onCancel={() => setEditId(null)} />
                        ) : (
                            <div className="flex items-start gap-3">
                                <span className="mt-1 cursor-grab text-gray-300 dark:text-gray-600"><GripIcon /></span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white">{item.institution}</p>
                                    {(item.degree || item.field_of_study) && (
                                        <p className="text-sm text-violet-600 dark:text-violet-400">
                                            {[item.degree, item.field_of_study].filter(Boolean).join(' — ')}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {fmtMonth(item.start_date)} — {item.end_date ? fmtMonth(item.end_date) : 'Present'}
                                        {item.gpa && <span className="ml-2">· GPA {item.gpa}</span>}
                                    </p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button className={btnSecondary} onClick={() => setEditId(item.id)}>Edit</button>
                                    <button className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400" onClick={() => handleDelete(item.id)}>Delete</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {items.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No education entries yet.</p>}
            </div>
        </div>
    )
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

const TABS = [
    { id: 'profile', label: 'Profile', component: ProfileTab },
    { id: 'projects', label: 'Projects', component: ProjectsTab },
    { id: 'skills', label: 'Skills', component: SkillsTab },
    { id: 'experience', label: 'Experience', component: ExperienceTab },
    { id: 'education', label: 'Education', component: EducationTab },
]

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('profile')
    const ActiveComponent = TABS.find(t => t.id === activeTab)?.component

    return (
        <AuthenticatedLayout header={
            <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Content Manager</h2>
        }>
            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Tab bar */}
                    <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex gap-1">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
                                        activeTab === tab.id
                                            ? 'border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab content */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        {ActiveComponent && <ActiveComponent />}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
