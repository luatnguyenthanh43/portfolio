import ThemeToggle from '@/Components/ThemeToggle'
import useInView from '@/hooks/useInView'
import api from '@/lib/api'
import { useEffect, useState } from 'react'

// A ledger row: its top hairline draws in from the left when it scrolls into view.
function Row({ children, className = '' }) {
    const [ref, inView] = useInView()
    return (
        <div ref={ref} className={`ledger-row ${inView ? 'visible' : ''} ${className}`}>
            {children}
        </div>
    )
}

function SectionHeading({ children }) {
    return (
        <h2 className="font-display mb-6 text-4xl font-bold tracking-tight text-[color:var(--w-heading)] sm:text-5xl">
            {children}
        </h2>
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

function Hero({ profile, experiences, projects, skills }) {
    if (!profile) return null

    const name = (profile.name || '').trim()
    // size the single-line name from its length so it fills the column without wrapping
    const nameSize = `min(${(100 / (Math.max(name.length, 6) * 0.5)).toFixed(2)}cqw, 12.5rem)`

    const current = experiences?.find(e => !e.end_date) || experiences?.[0]
    const totalMonths = calcTotalMonths(experiences)
    const yrs = Math.floor(totalMonths / 12)
    const mos = totalMonths % 12
    const experience = yrs > 0 ? `${yrs} year${yrs > 1 ? 's' : ''}${mos ? `, ${mos} mo` : ''}` : mos > 0 ? `${mos} months` : null
    const topSkills = (skills || []).slice(0, 6).map(x => x.name)

    const facts = [
        current && { label: current.end_date ? 'Last role' : 'Working as', value: `${current.role} at ${current.company}` },
        profile.location && { label: 'Based in', value: profile.location },
        experience && { label: 'Experience', value: experience },
        projects?.length ? { label: 'Shipped', value: `${projects.length} project${projects.length > 1 ? 's' : ''}` } : null,
        topSkills.length ? { label: 'Strongest in', value: topSkills.join(', ') } : null,
    ].filter(Boolean)

    return (
        <section className="py-16 sm:py-24 lg:py-32">
            <div style={{ containerType: 'inline-size' }}>
                <h1
                    className="font-display whitespace-nowrap font-extrabold leading-[0.95] tracking-[-0.045em]"
                    style={{ color: 'var(--w-heading)', margin: 0, fontSize: nameSize }}
                >
                    <span className="name-line"><span>{name}</span></span>
                </h1>
            </div>

            <div className="mt-10 grid items-start gap-12 sm:mt-14 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-16">
            <div>

                {profile.title && (
                    <p className="hero-fade font-display text-2xl font-medium sm:text-3xl" style={{ color: 'var(--w-accent)', animationDelay: '450ms' }}>
                        {profile.title}
                    </p>
                )}

                {profile.bio && (
                    <div
                        className="hero-fade prose-bio font-serif-body mt-6 max-w-[34rem] text-xl leading-[1.6]"
                        style={{ color: 'var(--w-text)', animationDelay: '600ms' }}
                        dangerouslySetInnerHTML={{ __html: profile.bio }}
                    />
                )}

                <div className="hero-fade mt-10 flex flex-wrap items-center gap-x-8 gap-y-4" style={{ animationDelay: '750ms' }}>
                    {profile.email && (
                        <a
                            href={`mailto:${profile.email}`}
                            className="rounded-lg px-6 py-3 text-base font-semibold text-white transition-transform hover:-translate-y-0.5"
                            style={{ background: '#00785F' }}
                        >
                            Email me
                        </a>
                    )}
                    {profile.github_url && <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-link text-base font-medium">GitHub</a>}
                    {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-link text-base font-medium">LinkedIn</a>}
                </div>
            </div>

            {(facts.length > 0 || profile.avatar_url) && (
                <aside className="hero-fade" style={{ animationDelay: '900ms' }} aria-label="At a glance">
                    {profile.avatar_url && (
                        <img
                            src={profile.avatar_url}
                            alt={profile.name}
                            className="mb-8 aspect-square w-40 rounded-2xl object-cover sm:w-48"
                        />
                    )}
                    <dl className="m-0" style={{ borderBottom: '1px solid var(--w-line)' }}>
                        {facts.map(f => (
                            <div key={f.label} className="grid grid-cols-[7.5rem_1fr] gap-4 py-3.5" style={{ borderTop: '1px solid var(--w-line)' }}>
                                <dt className="text-base" style={{ color: 'var(--w-muted)' }}>{f.label}</dt>
                                <dd className="m-0 text-base font-medium" style={{ color: 'var(--w-heading)' }}>{f.value}</dd>
                            </div>
                        ))}
                        {profile.phone && (
                            <div className="grid grid-cols-[7.5rem_1fr] gap-4 py-3.5" style={{ borderTop: '1px solid var(--w-line)' }}>
                                <dt className="text-base" style={{ color: 'var(--w-muted)' }}>Phone</dt>
                                <dd className="m-0 text-base font-medium"><a href={`tel:${profile.phone}`} className="text-link">{profile.phone}</a></dd>
                            </div>
                        )}
                        {profile.email && (
                            <div className="grid grid-cols-[7.5rem_1fr] gap-4 py-3.5" style={{ borderTop: '1px solid var(--w-line)' }}>
                                <dt className="text-base" style={{ color: 'var(--w-muted)' }}>Email</dt>
                                <dd className="m-0 min-w-0 break-words text-base font-medium"><a href={`mailto:${profile.email}`} className="text-link">{profile.email}</a></dd>
                            </div>
                        )}
                    </dl>
                </aside>
            )}
            </div>
        </section>
    )
}

const GRID = 'md:grid md:grid-cols-[11rem_minmax(0,1fr)] md:gap-10'
const metaCls = 'mb-3 text-base md:mb-0'

function Projects({ projects }) {
    if (!projects?.length) return null
    // featured work first, otherwise keep the dashboard order
    const sorted = [...projects].sort((a, b) => Number(!!b.featured) - Number(!!a.featured))

    return (
        <section className="py-12 sm:py-16">
            <SectionHeading>Projects</SectionHeading>
            <div>
                {sorted.map(p => (
                    <Row key={p.id} className={`project py-6 ${GRID}`}>
                        <div className={metaCls} style={{ color: 'var(--w-muted)' }}>
                            {p.company && <div className="font-display text-xl font-bold" style={{ color: 'var(--w-heading)' }}>{p.company}</div>}
                            {p.role && <div>{p.role}</div>}
                        </div>

                        <div className="min-w-0">
                            <h3 className={`project-title font-display font-bold tracking-tight text-[color:var(--w-heading)] ${p.featured ? 'text-4xl' : 'text-3xl'}`}>
                                {p.demo_url ? <a href={p.demo_url} target="_blank" rel="noreferrer">{p.title}</a> : p.title}
                            </h3>

                            {p.summary && (
                                <p className="mt-3 max-w-[38rem] text-xl font-medium leading-snug" style={{ color: 'var(--w-heading)' }}>{p.summary}</p>
                            )}

                            {p.image_url && (
                                <img src={p.image_url} alt={p.title} loading="lazy" className="mt-5 aspect-[16/9] w-full max-w-2xl rounded-lg object-cover" />
                            )}

                            {p.description && (
                                <div
                                    className="prose-bio font-serif-body mt-4 max-w-[38rem] text-xl leading-[1.6]"
                                    style={{ color: 'var(--w-text)' }}
                                    dangerouslySetInnerHTML={{ __html: p.description }}
                                />
                            )}

                            {p.tech_stack?.length > 0 && (
                                <ul className="mt-4 flex flex-wrap gap-2 p-0" style={{ listStyle: 'none' }}>
                                    {p.tech_stack.map(t => (
                                        <li key={t} className="rounded-full px-3 py-1 text-sm" style={{ color: 'var(--w-text)', border: '1px solid var(--w-line)' }}>{t}</li>
                                    ))}
                                </ul>
                            )}

                            {(p.demo_url || p.github_url) && (
                                <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2">
                                    {p.demo_url && <a href={p.demo_url} target="_blank" rel="noreferrer" className="text-link text-base font-medium">Live demo</a>}
                                    {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" className="text-link text-base font-medium">Source code</a>}
                                </div>
                            )}
                        </div>
                    </Row>
                ))}
            </div>
        </section>
    )
}

function SkillItem({ name }) {
    return <li className="text-base font-medium text-[color:var(--w-heading)]">{name}</li>
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
        <section className="py-12 sm:py-16">
            <SectionHeading>Skills</SectionHeading>
            <div>
                {Object.entries(grouped).map(([category, items]) => (
                    <Row key={category} className={`py-6 ${GRID}`}>
                        <h3 className="font-display mb-5 text-2xl font-bold tracking-tight text-[color:var(--w-heading)] md:mb-0">{category}</h3>
                        <ul className="m-0 grid list-none gap-x-12 gap-y-6 p-0 sm:grid-cols-2">
                            {items.map(s => <SkillItem key={s.id} name={s.name} />)}
                        </ul>
                    </Row>
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

// Dates are optional: show whichever are known, nothing if neither.
function dateRange(start, end) {
    if (start) return `${start} – ${end || 'Present'}`
    return end || null
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
        <section className="py-12 sm:py-16">
            <SectionHeading>Experience</SectionHeading>
            <div>
                {experiences.map(e => {
                    const duration = calcDuration(e.start_date, e.end_date)
                    const where = [e.employment_type, e.location].filter(Boolean).join(', ')
                    return (
                        <Row key={e.id} className={`py-6 ${GRID}`}>
                            <div className={metaCls} style={{ color: 'var(--w-muted)' }}>
                                {dateRange(e.start_date, e.end_date) && <div style={{ color: 'var(--w-heading)' }} className="font-medium">{dateRange(e.start_date, e.end_date)}</div>}
                                {duration && <div>{duration}</div>}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-display text-3xl font-bold tracking-tight text-[color:var(--w-heading)]">{e.role}</h3>
                                <p className="mt-1 text-lg font-medium" style={{ color: 'var(--w-accent)' }}>
                                    {e.company}{where && <span className="font-normal" style={{ color: 'var(--w-muted)' }}>, {where}</span>}
                                </p>

                                {e.description && (
                                    <div
                                        className="prose-bio font-serif-body mt-4 max-w-[38rem] text-xl leading-[1.6]"
                                        style={{ color: 'var(--w-text)' }}
                                        dangerouslySetInnerHTML={{ __html: e.description }}
                                    />
                                )}

                                {e.key_achievements?.length > 0 && (
                                    <ul className="mt-4 max-w-[38rem] list-disc space-y-1.5 pl-5 text-base marker:text-[color:var(--w-accent)]" style={{ color: 'var(--w-text)' }}>
                                        {e.key_achievements.map((a, i) => <li key={i}>{a}</li>)}
                                    </ul>
                                )}

                                {e.tech_stack?.length > 0 && (
                                    <p className="mt-4 text-base" style={{ color: 'var(--w-muted)' }}>
                                        Worked with <span style={{ color: 'var(--w-text)' }}>{e.tech_stack.join(', ')}</span>
                                    </p>
                                )}
                            </div>
                        </Row>
                    )
                })}
            </div>
        </section>
    )
}

function Education({ educations }) {
    if (!educations?.length) return null
    return (
        <section className="py-12 sm:py-16">
            <SectionHeading>Education</SectionHeading>
            <div>
                {educations.map(e => (
                    <Row key={e.id} className={`py-6 ${GRID}`}>
                        <div className={metaCls} style={{ color: 'var(--w-muted)' }}>
                            {dateRange(e.start_date, e.end_date) && <div style={{ color: 'var(--w-heading)' }} className="font-medium">{dateRange(e.start_date, e.end_date)}</div>}
                            {e.gpa && <div>GPA {e.gpa}</div>}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-display text-3xl font-bold tracking-tight text-[color:var(--w-heading)]">{e.institution}</h3>
                            {(e.degree || e.field_of_study) && (
                                <p className="mt-1 text-lg font-medium" style={{ color: 'var(--w-accent)' }}>
                                    {[e.degree, e.field_of_study].filter(Boolean).join(', ')}
                                </p>
                            )}
                            {e.description && (
                                <div
                                    className="prose-bio font-serif-body mt-4 max-w-[38rem] text-xl leading-[1.6]"
                                    style={{ color: 'var(--w-text)' }}
                                    dangerouslySetInnerHTML={{ __html: e.description }}
                                />
                            )}
                        </div>
                    </Row>
                ))}
            </div>
        </section>
    )
}

function Certifications({ certifications }) {
    if (!certifications?.length) return null
    return (
        <section className="py-12 sm:py-16">
            <SectionHeading>Certifications</SectionHeading>
            <div>
                {certifications.map(c => (
                    <Row key={c.id} className={`py-6 ${GRID}`}>
                        <div className={metaCls} style={{ color: 'var(--w-muted)' }}>
                            {c.issue_date && <div style={{ color: 'var(--w-heading)' }} className="font-medium">{c.issue_date}</div>}
                            {c.issuer && <div>{c.issuer}</div>}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-display text-3xl font-bold tracking-tight text-[color:var(--w-heading)]">{c.title}</h3>

                            {c.image_url && (
                                <img src={c.image_url} alt={`${c.title} certificate`} loading="lazy" className="mt-5 w-full max-w-md rounded-lg border object-contain" style={{ borderColor: 'var(--w-line)' }} />
                            )}

                            {c.description && (
                                <div
                                    className="prose-bio font-serif-body mt-4 max-w-[38rem] text-xl leading-[1.6]"
                                    style={{ color: 'var(--w-text)' }}
                                    dangerouslySetInnerHTML={{ __html: c.description }}
                                />
                            )}

                            {c.credential_url && (
                                <div className="mt-5">
                                    <a href={c.credential_url} target="_blank" rel="noreferrer" className="text-link text-base font-medium">Verify credential</a>
                                </div>
                            )}
                        </div>
                    </Row>
                ))}
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
    { label: 'Certifications', id: 'certifications' },
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
        <div className="min-h-screen" style={{ background: 'var(--w-bg)' }}>
            <header
                className="sticky top-0 z-40 transition-all duration-300"
                style={scrolled
                    ? { background: 'var(--w-nav)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,167,111,0.2)' }
                    : { background: 'transparent' }
                }
            >
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <button onClick={() => scrollTo('hero')} className="font-display text-lg font-bold tracking-tight" style={{ color: 'var(--w-heading)' }}>
                            {portfolio?.profile?.name || 'Portfolio'}
                        </button>

                        {/* Desktop nav links */}
                        <nav className="hidden sm:flex items-center gap-1">
                            {NAV_LINKS.map(link => (
                                <button
                                    key={link.id}
                                    onClick={() => scrollTo(link.id)}
                                    className="relative px-4 py-2 text-sm font-medium transition-colors duration-200"
                                    style={{ color: activeSection === link.id ? 'var(--w-accent)' : 'var(--w-text)' }}
                                    onMouseEnter={e => { if (activeSection !== link.id) e.currentTarget.style.color = 'var(--w-heading)' }}
                                    onMouseLeave={e => { if (activeSection !== link.id) e.currentTarget.style.color = 'var(--w-text)' }}
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
                                <span className="block h-0.5 w-5 rounded transition-all duration-300" style={{ background: mobileOpen ? 'var(--w-accent)' : 'var(--w-text)', transform: mobileOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
                                <span className="block h-0.5 w-5 rounded transition-all duration-300" style={{ background: mobileOpen ? 'transparent' : 'var(--w-text)', opacity: mobileOpen ? 0 : 1 }} />
                                <span className="block h-0.5 w-5 rounded transition-all duration-300" style={{ background: mobileOpen ? 'var(--w-accent)' : 'var(--w-text)', transform: mobileOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="sm:hidden px-4 pb-4 pt-2" style={{ background: 'var(--w-nav-solid)', borderTop: '1px solid rgba(0,167,111,0.15)' }}>
                        {NAV_LINKS.map(link => (
                            <button
                                key={link.id}
                                onClick={() => { scrollTo(link.id); setMobileOpen(false) }}
                                className="flex w-full items-center gap-3 py-3 text-sm font-medium transition-colors"
                                style={{ color: activeSection === link.id ? 'var(--w-accent)' : 'var(--w-text)', borderBottom: '1px solid var(--w-line)' }}
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
                        <div id="projects"><Projects projects={portfolio.projects} /></div>
                        <div id="skills"><Skills skills={portfolio.skills} /></div>
                        <div id="experience"><Experience experiences={portfolio.experiences} /></div>
                        <div id="education"><Education educations={portfolio.educations} /></div>
                        <div id="certifications"><Certifications certifications={portfolio.certifications} /></div>
                    </main>
                ) : (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: '#00A76F', borderTopColor: 'transparent' }} />
                    </div>
                )}

                <footer className="py-10 text-center text-sm" style={{ color: 'var(--w-muted)' }}>
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
