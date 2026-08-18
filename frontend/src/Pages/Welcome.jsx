import ThemeToggle from '@/Components/ThemeToggle'
import useInView from '@/hooks/useInView'
import api from '@/lib/api'
import { useEffect, useRef, useState } from 'react'

function Reveal({ children, delay = 0, className = '' }) {
    const [ref, inView] = useInView()
    return (
        <div
            ref={ref}
            className={`reveal ${inView ? 'visible' : ''} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    )
}

function SectionHeading({ children }) {
    return (
        <Reveal className="mb-12 text-center">
            <h2 className="inline-block text-3xl font-bold text-white">
                {children}
            </h2>
            <div className="mx-auto mt-3 h-0.5 w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #00A76F, #00B8D9)' }} />
        </Reveal>
    )
}

function ParticlesBg() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full float-anim"
                    style={{
                        width: `${4 + (i % 4) * 3}px`,
                        height: `${4 + (i % 4) * 3}px`,
                        left: `${(i * 8.3) % 100}%`,
                        top: `${(i * 13.7) % 100}%`,
                        background: i % 2 === 0 ? 'rgba(0,167,111,0.4)' : 'rgba(0,184,217,0.4)',
                        animationDelay: `${i * 0.4}s`,
                        animationDuration: `${3 + (i % 3)}s`,
                    }}
                />
            ))}
        </div>
    )
}

function calcTotalMonths(experiences) {
    if (!experiences?.length) return 0
    return experiences.reduce((sum, e) => {
        const s = parseDate(e.start_date)
        const end = e.end_date ? parseDate(e.end_date) : new Date()
        if (!s || !end) return sum
        return sum + (end.getFullYear() - s.getFullYear()) * 12 + (end.getMonth() - s.getMonth())
    }, 0)
}

function Hero({ profile, experiences, projects, skills, educations }) {
    const [typed, setTyped] = useState('')
    const title = profile?.title || ''

    useEffect(() => {
        if (!title) return
        let i = 0
        setTyped('')
        const interval = setInterval(() => {
            setTyped(title.slice(0, i + 1))
            i++
            if (i >= title.length) clearInterval(interval)
        }, 60)
        return () => clearInterval(interval)
    }, [title])

    if (!profile) return null
    return (
        <section className="relative overflow-hidden py-32 text-center">
            <ParticlesBg />

            <div
                className="pointer-events-none absolute inset-0 -z-10"
                style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,167,111,0.12), transparent)' }}
            />

            {profile.avatar_url && (
                <div className="hero-avatar mx-auto mb-8 relative inline-block">
                    <div className="absolute inset-0 rounded-full neon-glow" style={{ margin: '-4px' }} />
                    <img
                        src={profile.avatar_url}
                        alt={profile.name}
                        className="relative h-32 w-32 rounded-full object-cover"
                        style={{ border: '2px solid #00A76F' }}
                    />
                    <div
                        className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2"
                        style={{ background: '#00A76F', borderColor: '#161C24' }}
                    />
                </div>
            )}

            <h1
                className="hero-anim delay-100 text-5xl font-extrabold sm:text-6xl tracking-tight"
                style={{
                    color: '#FFFFFF',
                    textShadow: '0 0 40px rgba(0,167,111,0.35), 0 2px 8px rgba(0,0,0,0.5)',
                }}
            >
                {profile.name}
            </h1>

            <p className="hero-anim delay-200 mt-4 text-xl font-mono font-medium min-h-[1.75rem]" style={{ color: '#00A76F' }}>
                <span style={{ color: '#00B8D9' }}>{'>'}</span> {typed}
                <span className="inline-block w-0.5 h-5 ml-0.5 align-middle" style={{ background: '#00A76F', animation: 'blink 1s step-end infinite' }} />
            </p>

            {profile.bio && (
                <div
                    className="hero-anim delay-300 prose-bio mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed"
                    style={{ color: '#919EAB' }}
                    dangerouslySetInnerHTML={{ __html: profile.bio }}
                />
            )}

            {/* Contact info strip */}
            {(profile.email || profile.phone || profile.location) && (
                <div className="hero-anim delay-350 mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
                    {profile.location && (
                        <span className="flex items-center gap-1.5 text-sm" style={{ color: '#919EAB' }}>
                            <svg className="h-4 w-4 shrink-0" style={{ color: '#00A76F' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {profile.location}
                        </span>
                    )}
                    {profile.email && (
                        <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 text-sm transition-colors hover:text-white" style={{ color: '#919EAB' }}>
                            <svg className="h-4 w-4 shrink-0" style={{ color: '#00A76F' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {profile.email}
                        </a>
                    )}
                    {profile.phone && (
                        <a href={`tel:${profile.phone}`} className="flex items-center gap-1.5 text-sm transition-colors hover:text-white" style={{ color: '#919EAB' }}>
                            <svg className="h-4 w-4 shrink-0" style={{ color: '#00B8D9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {profile.phone}
                        </a>
                    )}
                </div>
            )}

            <div className="hero-anim delay-400 mt-10 flex flex-wrap justify-center gap-4">
                {profile.email && (
                    <a
                        href={`mailto:${profile.email}`}
                        className="relative overflow-hidden rounded-xl px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1"
                        style={{
                            background: 'linear-gradient(135deg, #00A76F, #00B8D9)',
                            boxShadow: '0 0 20px rgba(0,167,111,0.4)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 35px rgba(0,167,111,0.7)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,167,111,0.4)'}
                    >
                        Contact Me
                    </a>
                )}
                {profile.github_url && (
                    <a
                        href={profile.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl px-7 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-1"
                        style={{
                            border: '1px solid rgba(0,167,111,0.4)',
                            color: '#00A76F',
                            background: 'rgba(0,167,111,0.05)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,167,111,0.15)'; e.currentTarget.style.borderColor = '#00A76F' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,167,111,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,167,111,0.4)' }}
                    >
                        GitHub
                    </a>
                )}
                {profile.linkedin_url && (
                    <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl px-7 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-1"
                        style={{
                            border: '1px solid rgba(0,184,217,0.4)',
                            color: '#00B8D9',
                            background: 'rgba(0,184,217,0.05)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,184,217,0.15)'; e.currentTarget.style.borderColor = '#00B8D9' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,184,217,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,184,217,0.4)' }}
                    >
                        LinkedIn
                    </a>
                )}
            </div>

            {/* Stats row */}
            {(() => {
                const totalMonths = calcTotalMonths(experiences)
                const yrs = Math.floor(totalMonths / 12)
                const mos = totalMonths % 12
                const expLabel = yrs > 0 ? (mos > 0 ? `${yrs}y ${mos}m` : `${yrs}+`) : mos > 0 ? `${mos}m` : '—'
                const stats = [
                    { value: expLabel, label: 'Experience', color: '#00A76F', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
                    { value: projects?.length ?? 0, label: 'Projects', color: '#00B8D9', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
                    { value: skills?.length ?? 0, label: 'Skills', color: '#00A76F', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
                    { value: educations?.length ?? 0, label: 'Education', color: '#00B8D9', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg> },
                ]
                return (
                    <div className="hero-anim delay-500 mt-12 grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                        {stats.map((s, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center gap-2 rounded-2xl py-5 px-3 text-center"
                                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}28` }}
                            >
                                <span style={{ color: s.color }}>{s.icon}</span>
                                <div className="text-2xl font-extrabold font-mono leading-none" style={{ color: s.color }}>{s.value}</div>
                                <div className="text-xs uppercase tracking-widest leading-tight" style={{ color: '#637381' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                )
            })()}

            <div className="hero-anim delay-500 mt-12 flex justify-center">
                <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 p-1" style={{ borderColor: 'rgba(0,167,111,0.4)' }}>
                    <div className="h-2 w-1 animate-bounce rounded-full" style={{ background: '#00A76F' }} />
                </div>
            </div>
        </section>
    )
}

const STATUS_STYLES = {
    'Completed':   { color: '#00A76F', bg: 'rgba(0,167,111,0.12)', border: 'rgba(0,167,111,0.35)' },
    'In Progress': { color: '#00B8D9', bg: 'rgba(0,184,217,0.12)', border: 'rgba(0,184,217,0.35)' },
    'Archived':    { color: '#637381', bg: 'rgba(99,115,129,0.12)', border: 'rgba(99,115,129,0.35)' },
}

function ProjectCard({ p, i }) {
    const status = STATUS_STYLES[p.status] || STATUS_STYLES['Completed']
    const featured = p.featured

    return (
        <Reveal delay={i * 80} className={featured ? 'sm:col-span-2 lg:col-span-1' : ''}>
            <div
                className="card-lift flex h-full flex-col rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                    background: '#212B36',
                    border: `1px solid ${featured ? 'rgba(0,167,111,0.35)' : 'rgba(0,167,111,0.12)'}`,
                    boxShadow: featured ? '0 0 30px rgba(0,167,111,0.1)' : 'none',
                }}
                onMouseEnter={ev => ev.currentTarget.style.borderColor = 'rgba(0,167,111,0.5)'}
                onMouseLeave={ev => ev.currentTarget.style.borderColor = featured ? 'rgba(0,167,111,0.35)' : 'rgba(0,167,111,0.12)'}
            >
                {/* Featured accent bar */}
                {featured && (
                    <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #00A76F, #00B8D9)' }} />
                )}

                {/* Image */}
                {p.image_url && (
                    <div className="relative overflow-hidden" style={{ height: '180px' }}>
                        <img
                            src={p.image_url}
                            alt={p.title}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #212B36 0%, transparent 60%)' }} />
                        {/* Overlay badges on image */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            {p.category && (
                                <span className="rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm" style={{ background: 'rgba(22,28,36,0.7)', color: '#919EAB', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    {p.category}
                                </span>
                            )}
                            {featured && (
                                <span className="ml-auto rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: 'rgba(0,167,111,0.25)', color: '#00A76F', border: '1px solid rgba(0,167,111,0.5)' }}>
                                    ★ Featured
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex flex-1 flex-col p-5">
                    {/* Top meta (no image case) */}
                    {!p.image_url && (p.category || featured) && (
                        <div className="mb-3 flex items-center gap-2">
                            {p.category && (
                                <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: '#919EAB', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    {p.category}
                                </span>
                            )}
                            {featured && (
                                <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: 'rgba(0,167,111,0.12)', color: '#00A76F', border: '1px solid rgba(0,167,111,0.4)' }}>
                                    ★ Featured
                                </span>
                            )}
                        </div>
                    )}

                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold leading-snug text-white">{p.title}</h3>
                        {p.year && <span className="shrink-0 text-xs font-mono mt-0.5" style={{ color: '#637381' }}>{p.year}</span>}
                    </div>

                    {/* Status badge */}
                    {p.status && (
                        <div className="mt-2">
                            <span
                                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                                style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}
                            >
                                <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color, boxShadow: p.status === 'In Progress' ? `0 0 6px ${status.color}` : 'none' }} />
                                {p.status}
                            </span>
                        </div>
                    )}

                    {/* Description */}
                    {p.description && (
                        <div className="prose-bio mt-3 flex-1 text-sm leading-relaxed" style={{ color: '#919EAB' }} dangerouslySetInnerHTML={{ __html: p.description }} />
                    )}

                    {/* Tech stack */}
                    {p.tech_stack?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {p.tech_stack.map(t => (
                                <span
                                    key={t}
                                    className="rounded-full px-2.5 py-0.5 text-xs font-medium font-mono"
                                    style={{ background: 'rgba(0,167,111,0.08)', color: '#00A76F', border: '1px solid rgba(0,167,111,0.25)' }}
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Links */}
                    {(p.demo_url || p.github_url) && (
                        <div className="mt-4 flex items-center gap-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            {p.demo_url && (
                                <a
                                    href={p.demo_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-75"
                                    style={{ color: '#00A76F' }}
                                >
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    Live Demo
                                </a>
                            )}
                            {p.github_url && (
                                <a
                                    href={p.github_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-75"
                                    style={{ color: '#00B8D9' }}
                                >
                                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                                    GitHub
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Reveal>
    )
}

function Projects({ projects }) {
    if (!projects?.length) return null
    const featured = projects.filter(p => p.featured)
    const rest = projects.filter(p => !p.featured)

    return (
        <section className="py-20">
            <SectionHeading>Projects</SectionHeading>

            {featured.length > 0 && (
                <div className="mb-8">
                    <p className="mb-4 text-xs font-mono uppercase tracking-widest" style={{ color: '#00A76F' }}>— Featured</p>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {featured.map((p, i) => <ProjectCard key={p.id} p={p} i={i} />)}
                    </div>
                </div>
            )}

            {rest.length > 0 && (
                <div>
                    {featured.length > 0 && (
                        <p className="mb-4 text-xs font-mono uppercase tracking-widest" style={{ color: '#637381' }}>— Other Projects</p>
                    )}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {rest.map((p, i) => <ProjectCard key={p.id} p={p} i={i} />)}
                    </div>
                </div>
            )}
        </section>
    )
}

function SkillBar({ name, level }) {
    const barRef = useRef(null)
    const [ref, inView] = useInView()

    useEffect(() => {
        if (inView && barRef.current) {
            barRef.current.style.setProperty('--target-w', `${level}%`)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (barRef.current) barRef.current.classList.add('filled')
                })
            })
        }
    }, [inView, level])

    return (
        <div ref={ref}>
            <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-medium text-white">{name}</span>
                <span style={{ color: '#00A76F' }}>{level}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div ref={barRef} className="skill-bar h-1.5 rounded-full" />
            </div>
        </div>
    )
}

function Skills({ skills }) {
    if (!skills?.length) return null
    const grouped = skills.reduce((acc, s) => {
        const cat = s.category || 'Other'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(s)
        return acc
    }, {})
    return (
        <section className="py-20">
            <SectionHeading>Skills</SectionHeading>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(grouped).map(([category, items], i) => (
                    <Reveal key={category} delay={i * 80}>
                        <div
                            className="card-lift rounded-2xl p-6 transition-all duration-300"
                            style={{
                                background: '#212B36',
                                border: '1px solid rgba(0,167,111,0.15)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,167,111,0.4)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,167,111,0.15)'}
                        >
                            <h3 className="mb-5 flex items-center gap-2 font-semibold text-white font-mono">
                                <span className="h-2 w-2 rounded-full" style={{ background: '#00A76F', boxShadow: '0 0 8px #00A76F' }} />
                                {category}
                            </h3>
                            <div className="space-y-4">
                                {items.map(s => <SkillBar key={s.id} name={s.name} level={s.level} />)}
                            </div>
                        </div>
                    </Reveal>
                ))}
            </div>
        </section>
    )
}

function parseDate(s) {
    if (!s) return null
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    // YYYY-MM-DD or YYYY-MM
    if (/^\d{4}-\d{2}/.test(s)) return new Date(s.length === 7 ? `${s}-01` : s)
    // "Jan 2022" or "Jan 15, 2022"
    const m1 = s.match(/^([A-Za-z]+)\s+(\d{4})$/)
    if (m1) return new Date(`${m1[2]}-${String(MONTHS.indexOf(m1[1]) + 1).padStart(2,'0')}-01`)
    const m2 = s.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})$/)
    if (m2) return new Date(`${m2[3]}-${String(MONTHS.indexOf(m2[1]) + 1).padStart(2,'0')}-${m2[2].padStart(2,'0')}`)
    return null
}

function calcDuration(start, end) {
    if (!start) return null
    const parse = parseDate
    const s = parse(start)
    const e = end ? parse(end) : new Date()
    if (!s || !e) return null
    const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth())
    if (months < 1) return null
    const y = Math.floor(months / 12), m = months % 12
    return y > 0 ? (m > 0 ? `${y}y ${m}m` : `${y}y`) : `${m}m`
}

function Experience({ experiences }) {
    if (!experiences?.length) return null
    return (
        <section className="py-20">
            <SectionHeading>Experience</SectionHeading>
            <div className="mx-auto max-w-3xl">
                <div className="relative pl-8" style={{ borderLeft: '2px solid rgba(0,167,111,0.25)' }}>
                    {experiences.map((e, i) => {
                        const duration = calcDuration(e.start_date, e.end_date)
                        const isCurrent = !e.end_date
                        return (
                            <Reveal key={e.id} delay={i * 100} className="relative mb-10 last:mb-0">
                                {/* Timeline dot */}
                                <div
                                    className="absolute -left-[2.65rem] top-5 h-4 w-4 rounded-full border-2"
                                    style={{ background: isCurrent ? '#00A76F' : '#161C24', borderColor: '#00A76F', boxShadow: isCurrent ? '0 0 14px rgba(0,167,111,0.7)' : '0 0 8px rgba(0,167,111,0.4)' }}
                                />

                                <div
                                    className="card-lift rounded-2xl transition-all duration-300 overflow-hidden"
                                    style={{ background: '#212B36', border: '1px solid rgba(0,167,111,0.15)' }}
                                    onMouseEnter={ev => ev.currentTarget.style.borderColor = 'rgba(0,167,111,0.4)'}
                                    onMouseLeave={ev => ev.currentTarget.style.borderColor = 'rgba(0,167,111,0.15)'}
                                >
                                    {/* Card top accent bar */}
                                    {isCurrent && (
                                        <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #00A76F, #00B8D9)' }} />
                                    )}

                                    <div className="p-6">
                                        {/* Header row */}
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-lg font-semibold text-white">{e.role}</h3>
                                                    {isCurrent && (
                                                        <span
                                                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                                                            style={{ background: 'rgba(0,167,111,0.15)', color: '#00A76F', border: '1px solid rgba(0,167,111,0.4)' }}
                                                        >
                                                            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#00A76F' }} />
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 font-semibold text-base" style={{ color: '#00A76F' }}>{e.company}</p>
                                            </div>

                                            {/* Date + duration */}
                                            <div className="text-right shrink-0">
                                                <span
                                                    className="inline-block rounded-full px-3 py-1 text-xs font-medium font-mono"
                                                    style={{ background: 'rgba(0,184,217,0.1)', color: '#00B8D9', border: '1px solid rgba(0,184,217,0.3)' }}
                                                >
                                                    {e.start_date} — {e.end_date || 'Present'}
                                                    {duration && (
                                                        <span style={{ color: '#637381' }}> · {duration}</span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Meta row: location + employment type */}
                                        {(e.location || e.employment_type) && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {e.employment_type && (
                                                    <span
                                                        className="rounded-full px-3 py-0.5 text-xs font-medium"
                                                        style={{ background: 'rgba(255,255,255,0.05)', color: '#919EAB', border: '1px solid rgba(255,255,255,0.1)' }}
                                                    >
                                                        {e.employment_type}
                                                    </span>
                                                )}
                                                {e.location && (
                                                    <span className="flex items-center gap-1 text-xs" style={{ color: '#637381' }}>
                                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                        {e.location}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Description */}
                                        {e.description && (
                                            <div className="prose-bio mt-4 text-sm leading-relaxed" style={{ color: '#919EAB' }} dangerouslySetInnerHTML={{ __html: e.description }} />
                                        )}

                                        {/* Key Achievements */}
                                        {e.key_achievements?.length > 0 && (
                                            <div className="mt-4">
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: '#00A76F' }}>Key Achievements</p>
                                                <ul className="space-y-1.5">
                                                    {e.key_achievements.map((a, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#919EAB' }}>
                                                            <span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full" style={{ background: '#00A76F', boxShadow: '0 0 6px rgba(0,167,111,0.5)' }} />
                                                            {a}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Tech stack */}
                                        {e.tech_stack?.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-1.5">
                                                {e.tech_stack.map(t => (
                                                    <span
                                                        key={t}
                                                        className="rounded-full px-2.5 py-0.5 text-xs font-medium font-mono"
                                                        style={{ background: 'rgba(0,167,111,0.08)', color: '#00A76F', border: '1px solid rgba(0,167,111,0.25)' }}
                                                    >
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Reveal>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

// ── Education ──────────────────────────────────────────────────────────────────
function Education({ educations }) {
    if (!educations?.length) return null
    return (
        <section className="py-20">
            <SectionHeading>Education</SectionHeading>
            <div className="mx-auto max-w-3xl space-y-5">
                {educations.map((e, i) => {
                    const isCurrent = !e.end_date
                    return (
                        <Reveal key={e.id} delay={i * 80}>
                            <div
                                className="card-lift rounded-2xl overflow-hidden transition-all duration-300"
                                style={{ background: '#212B36', border: `1px solid ${isCurrent ? 'rgba(0,184,217,0.3)' : 'rgba(0,167,111,0.12)'}` }}
                                onMouseEnter={ev => ev.currentTarget.style.borderColor = 'rgba(0,167,111,0.45)'}
                                onMouseLeave={ev => ev.currentTarget.style.borderColor = isCurrent ? 'rgba(0,184,217,0.3)' : 'rgba(0,167,111,0.12)'}
                            >
                                {isCurrent && <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #00B8D9, #00A76F)' }} />}
                                <div className="p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            {/* Institution + icon */}
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(0,184,217,0.1)', border: '1px solid rgba(0,184,217,0.25)' }}>
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#00B8D9' }}><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/></svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-semibold text-white">{e.institution}</h3>
                                                    {(e.degree || e.field_of_study) && (
                                                        <p className="text-sm font-medium" style={{ color: '#00B8D9' }}>
                                                            {[e.degree, e.field_of_study].filter(Boolean).join(' · ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Date + GPA */}
                                        <div className="text-right shrink-0">
                                            <span
                                                className="inline-block rounded-full px-3 py-1 text-xs font-medium font-mono"
                                                style={{ background: 'rgba(0,167,111,0.1)', color: '#00A76F', border: '1px solid rgba(0,167,111,0.3)' }}
                                            >
                                                {e.start_date} — {e.end_date || 'Present'}
                                            </span>
                                            {e.gpa && (
                                                <p className="mt-1 text-xs font-mono" style={{ color: '#637381' }}>GPA {e.gpa}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {e.description && (
                                        <div
                                            className="prose-bio mt-4 text-sm leading-relaxed"
                                            style={{ color: '#919EAB' }}
                                            dangerouslySetInnerHTML={{ __html: e.description }}
                                        />
                                    )}
                                </div>
                            </div>
                        </Reveal>
                    )
                })}
            </div>
        </section>
    )
}

const NAV_LINKS = [
    { label: 'Home', id: 'hero' },
    { label: 'Projects', id: 'projects' },
    { label: 'Skills', id: 'skills' },
    { label: 'Experience', id: 'experience' },
    { label: 'Education', id: 'education' },
]

function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Welcome() {
    const [portfolio, setPortfolio] = useState(null)
    const [scrolled, setScrolled] = useState(false)
    const [activeSection, setActiveSection] = useState('hero')
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        api.get('/portfolio').then(r => setPortfolio(r.data)).catch(() => {})

        const onScroll = () => {
            setScrolled(window.scrollY > 20)
            const sections = NAV_LINKS.map(l => document.getElementById(l.id))
            const scrollY = window.scrollY + 100
            for (let i = sections.length - 1; i >= 0; i--) {
                if (sections[i] && sections[i].offsetTop <= scrollY) {
                    setActiveSection(NAV_LINKS[i].id)
                    break
                }
            }
        }
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div className="min-h-screen" style={{ background: '#161C24' }}>
            <header
                className="sticky top-0 z-40 transition-all duration-300"
                style={scrolled
                    ? { background: 'rgba(22,28,36,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,167,111,0.2)' }
                    : { background: 'transparent' }
                }
            >
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <button onClick={() => scrollTo('hero')} className="text-lg font-bold font-mono" style={{ color: '#00A76F' }}>
                            <span style={{ color: '#00B8D9' }}>{'<'}</span>Portfolio<span style={{ color: '#00B8D9' }}>{'/>'}</span>
                        </button>

                        {/* Desktop nav links */}
                        <nav className="hidden sm:flex items-center gap-1">
                            {NAV_LINKS.map(link => (
                                <button
                                    key={link.id}
                                    onClick={() => scrollTo(link.id)}
                                    className="relative px-4 py-2 text-sm font-medium transition-colors duration-200"
                                    style={{ color: activeSection === link.id ? '#00A76F' : '#919EAB' }}
                                    onMouseEnter={e => { if (activeSection !== link.id) e.currentTarget.style.color = '#FFFFFF' }}
                                    onMouseLeave={e => { if (activeSection !== link.id) e.currentTarget.style.color = '#919EAB' }}
                                >
                                    {link.label}
                                    {activeSection === link.id && (
                                        <span
                                            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full"
                                            style={{ background: '#00A76F', boxShadow: '0 0 8px #00A76F' }}
                                        />
                                    )}
                                </button>
                            ))}
                        </nav>

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            {/* Mobile hamburger */}
                            <button
                                className="sm:hidden flex flex-col justify-center gap-1.5 w-8 h-8"
                                onClick={() => setMobileOpen(o => !o)}
                                aria-label="Toggle menu"
                            >
                                <span className="block h-0.5 w-5 rounded transition-all duration-300" style={{ background: mobileOpen ? '#00A76F' : '#919EAB', transform: mobileOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
                                <span className="block h-0.5 w-5 rounded transition-all duration-300" style={{ background: mobileOpen ? 'transparent' : '#919EAB', opacity: mobileOpen ? 0 : 1 }} />
                                <span className="block h-0.5 w-5 rounded transition-all duration-300" style={{ background: mobileOpen ? '#00A76F' : '#919EAB', transform: mobileOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="sm:hidden px-4 pb-4 pt-2" style={{ background: 'rgba(22,28,36,0.98)', borderTop: '1px solid rgba(0,167,111,0.15)' }}>
                        {NAV_LINKS.map(link => (
                            <button
                                key={link.id}
                                onClick={() => { scrollTo(link.id); setMobileOpen(false) }}
                                className="flex w-full items-center gap-3 py-3 text-sm font-medium transition-colors"
                                style={{ color: activeSection === link.id ? '#00A76F' : '#919EAB', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                            >
                                {activeSection === link.id && <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#00A76F', boxShadow: '0 0 6px #00A76F' }} />}
                                {link.label}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {portfolio ? (
                    <main>
                        <div id="hero"><Hero profile={portfolio.profile} experiences={portfolio.experiences} projects={portfolio.projects} skills={portfolio.skills} educations={portfolio.educations} /></div>
                        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,167,111,0.3), transparent)' }} />
                        <div id="projects"><Projects projects={portfolio.projects} /></div>
                        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,184,217,0.3), transparent)' }} />
                        <div id="skills"><Skills skills={portfolio.skills} /></div>
                        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,167,111,0.3), transparent)' }} />
                        <div id="experience"><Experience experiences={portfolio.experiences} /></div>
                        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,184,217,0.3), transparent)' }} />
                        <div id="education"><Education educations={portfolio.educations} /></div>
                    </main>
                ) : (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: '#00A76F', borderTopColor: 'transparent' }} />
                    </div>
                )}

                <footer className="py-10 text-center text-sm" style={{ color: '#637381' }}>
                    {portfolio?.profile?.name && (
                        <span>© {new Date().getFullYear()} {portfolio.profile.name}. All rights reserved.</span>
                    )}
                </footer>
            </div>

            {/* Back to top button */}
            {scrolled && (
                <button
                    onClick={() => scrollTo('hero')}
                    aria-label="Back to top"
                    className="fixed bottom-8 right-8 z-50 flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300"
                    style={{
                        background: 'linear-gradient(135deg, #00A76F, #00B8D9)',
                        boxShadow: '0 4px 20px rgba(0,167,111,0.4)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 28px rgba(0,167,111,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,167,111,0.4)'}
                >
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                    </svg>
                </button>
            )}
        </div>
    )
}
