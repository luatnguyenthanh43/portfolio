import Dropdown from '@/Components/Dropdown'
import ThemeToggle from '@/Components/ThemeToggle'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/dashboard' },
]

export default function AuthenticatedLayout({ header, children }) {
    const { user, logout } = useAuth()
    const location = useLocation()
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <div className="min-h-screen" style={{ background: '#161C24' }}>
            <nav
                className="sticky top-0 z-40 transition-all duration-300"
                style={{ background: 'rgba(22,28,36,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,167,111,0.2)' }}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-8">
                            <Link to="/" className="text-lg font-bold font-mono" style={{ color: '#00A76F' }}>
                                <span style={{ color: '#00B8D9' }}>{'<'}</span>Portfolio<span style={{ color: '#00B8D9' }}>{'/>'}</span>
                            </Link>

                            {/* Desktop nav */}
                            <div className="hidden sm:flex items-center gap-1">
                                {NAV_ITEMS.map(item => {
                                    const active = location.pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            to={item.href}
                                            className="relative px-4 py-2 text-sm font-medium transition-colors duration-200"
                                            style={{ color: active ? '#00A76F' : '#919EAB' }}
                                        >
                                            {item.label}
                                            {active && (
                                                <span
                                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full"
                                                    style={{ background: '#00A76F', boxShadow: '0 0 8px #00A76F' }}
                                                />
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="hidden sm:flex items-center gap-3">
                            <ThemeToggle />
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200"
                                        style={{ color: '#919EAB', border: '1px solid rgba(0,167,111,0.2)', background: 'rgba(0,167,111,0.05)' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,167,111,0.5)'; e.currentTarget.style.color = '#00A76F' }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,167,111,0.2)'; e.currentTarget.style.color = '#919EAB' }}
                                    >
                                        <span
                                            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                                            style={{ background: 'linear-gradient(135deg, #00A76F, #00B8D9)' }}
                                        >
                                            {user?.name?.charAt(0)?.toUpperCase()}
                                        </span>
                                        {user?.name}
                                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href="/profile">Profile</Dropdown.Link>
                                    <Dropdown.Link onClick={logout}>Log Out</Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        {/* Mobile right */}
                        <div className="flex items-center gap-2 sm:hidden">
                            <ThemeToggle />
                            <button
                                className="flex flex-col justify-center gap-1.5 w-8 h-8"
                                onClick={() => setMobileOpen(o => !o)}
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
                        {NAV_ITEMS.map(item => {
                            const active = location.pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex w-full items-center gap-3 py-3 text-sm font-medium"
                                    style={{ color: active ? '#00A76F' : '#919EAB', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                >
                                    {active && <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#00A76F', boxShadow: '0 0 6px #00A76F' }} />}
                                    {item.label}
                                </Link>
                            )
                        })}
                        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex items-center gap-3 mb-3">
                                <span
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                                    style={{ background: 'linear-gradient(135deg, #00A76F, #00B8D9)' }}
                                >
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </span>
                                <div>
                                    <div className="text-sm font-medium text-white">{user?.name}</div>
                                    <div className="text-xs" style={{ color: '#637381' }}>{user?.email}</div>
                                </div>
                            </div>
                            <Link to="/profile" onClick={() => setMobileOpen(false)} className="block py-2 text-sm" style={{ color: '#919EAB' }}>Profile</Link>
                            <button onClick={logout} className="block py-2 text-sm w-full text-left" style={{ color: '#919EAB' }}>Log Out</button>
                        </div>
                    </div>
                )}
            </nav>

            {header && (
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="text-lg font-semibold text-white">{header}</div>
                </div>
            )}

            <main>{children}</main>
        </div>
    )
}
