import { render, screen, within, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import Welcome from '@/Pages/Welcome'
import { apiMock, apiError, resetApiMock } from '@/test/mockApi'

vi.mock('@/lib/api', async () => {
    const m = await import('@/test/mockApi')
    return { default: m.apiMock, getCsrfCookie: m.getCsrfCookie }
})

const full = () => ({
    profile: { name: 'Ada Lovelace', title: 'Engineer', bio: '<p>Hello <strong>world</strong></p>', email: 'ada@x.io', github_url: 'https://gh/ada', linkedin_url: 'https://li/ada', location: 'London', phone: '123', avatar_url: null },
    projects: [
        { id: 1, title: 'Alpha', summary: 'Sum A', description: '<p>Desc A</p>', tech_stack: ['React', 'Laravel'], demo_url: 'https://demo/a', github_url: 'https://src/a', featured: false },
        { id: 2, title: 'Beta', summary: null, description: null, tech_stack: null, demo_url: null, github_url: null, featured: true, company: null, role: null, image_url: null },
    ],
    skills: [
        { id: 1, name: 'PHP', category: 'Backend' },
        { id: 2, name: 'Go', category: 'Backend' },
        { id: 3, name: 'React', category: 'Frontend' },
        { id: 4, name: 'Git', category: null },
    ],
    experiences: [
        { id: 1, role: 'Dev', company: 'Acme', start_date: '2020-01-01', end_date: '2022-03-01', employment_type: 'Full-time', location: 'Remote', description: null, key_achievements: ['Shipped X'], tech_stack: ['Vue'] },
    ],
    educations: [{ id: 1, institution: 'MIT', degree: 'BSc', field_of_study: 'CS', start_date: '2010', end_date: '2014', gpa: '3.9', description: null }],
    certifications: [{ id: 1, title: 'AWS SA', issuer: 'Amazon', issue_date: '2021', credential_url: 'https://verify', description: null, image_url: null }],
})

const empty = { profile: null, projects: [], skills: [], experiences: [], educations: [], certifications: [] }

describe('Welcome', () => {
    beforeEach(() => resetApiMock())

    it('shows a loading spinner until data arrives and fetches /portfolio', async () => {
        apiMock.get.mockReturnValue(new Promise(() => {}))
        render(<Welcome />)
        expect(screen.queryByRole('main')).not.toBeInTheDocument()
        expect(apiMock.get).toHaveBeenCalledWith('/portfolio')
    })

    it('renders profile, projects, skills, experience, education, certifications', async () => {
        apiMock.get.mockResolvedValue({ data: full() })
        render(<Welcome />)
        expect(await screen.findByRole('heading', { level: 1, name: 'Ada Lovelace' })).toBeInTheDocument()
        expect(screen.getByText('Engineer')).toBeInTheDocument()
        expect(screen.getByText('world').tagName).toBe('STRONG')
        expect(screen.getByRole('link', { name: 'Email me' })).toHaveAttribute('href', 'mailto:ada@x.io')
        expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://gh/ada')
        expect(screen.getByText('London')).toBeInTheDocument()
        expect(screen.getByText(/© \d{4} Ada Lovelace/)).toBeInTheDocument()

        // projects: featured first
        const titles = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent)
        expect(titles.slice(0, 2)).toEqual(['Beta', 'Alpha'])
        expect(screen.getByText('Sum A')).toBeInTheDocument()
        expect(within(document.getElementById('projects')).getByText('React')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Live demo/ })).toHaveAttribute('href', 'https://demo/a')
        expect(screen.getByRole('link', { name: /Source code/ })).toHaveAttribute('href', 'https://src/a')

        // skills grouped by category with "Other" fallback
        const skills = document.getElementById('skills')
        expect(within(skills).getByRole('heading', { name: 'Backend' })).toBeInTheDocument()
        expect(within(skills).getByRole('heading', { name: 'Frontend' })).toBeInTheDocument()
        expect(within(skills).getByRole('heading', { name: 'Other' })).toBeInTheDocument()
        expect(within(skills).getAllByRole('listitem')).toHaveLength(4)

        // experience: range + duration (2y 2m)
        const exp = document.getElementById('experience')
        expect(within(exp).getByText('2020-01-01 – 2022-03-01')).toBeInTheDocument()
        expect(within(exp).getByText('2y 2m')).toBeInTheDocument()
        expect(within(exp).getByText('Shipped X')).toBeInTheDocument()
        expect(within(exp).getByText('Vue')).toBeInTheDocument()

        const edu = document.getElementById('education')
        expect(within(edu).getByRole('heading', { name: 'MIT' })).toBeInTheDocument()
        expect(within(edu).getByText('BSc, CS')).toBeInTheDocument()
        expect(within(edu).getByText('GPA 3.9')).toBeInTheDocument()

        expect(screen.getByRole('heading', { name: 'AWS SA' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Verify credential' })).toHaveAttribute('href', 'https://verify')
    })

    it('hides sections whose data is empty and does not crash with a null profile', async () => {
        apiMock.get.mockResolvedValue({ data: empty })
        render(<Welcome />)
        await waitFor(() => expect(screen.getByRole('main')).toBeInTheDocument())
        for (const h of ['Projects', 'Skills', 'Experience', 'Education', 'Certifications']) {
            expect(screen.queryByRole('heading', { level: 2, name: h })).not.toBeInTheDocument()
        }
        expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    })

    it('copes with null optional fields on a minimal profile', async () => {
        const data = { ...empty, profile: { name: 'Min', title: null, bio: null, email: null, github_url: null, linkedin_url: null, location: null, phone: null, avatar_url: null },
            experiences: [{ id: 1, role: 'R', company: 'C', start_date: null, end_date: null, employment_type: null, location: null, description: null, key_achievements: null, tech_stack: null }] }
        apiMock.get.mockResolvedValue({ data })
        render(<Welcome />)
        expect(await screen.findByRole('heading', { level: 1, name: 'Min' })).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: 'Email me' })).not.toBeInTheDocument()
        expect(screen.getByRole('heading', { level: 3, name: 'R' })).toBeInTheDocument()
    })

    describe('date helpers (via Experience)', () => {
        const render1 = async (start, end) => {
            apiMock.get.mockResolvedValue({ data: { ...empty, experiences: [{ id: 1, role: 'R', company: 'C', start_date: start, end_date: end }] } })
            render(<Welcome />)
            await screen.findByRole('heading', { level: 3, name: 'R' })
            return within(document.getElementById('experience'))
        }
        it('shows "Present" when there is no end date', async () => {
            const ui = await render1('Jan 2020', null)
            expect(ui.getByText('Jan 2020 – Present')).toBeInTheDocument()
        })
        it('computes duration from "Mon YYYY" and "YYYY-MM" formats', async () => {
            const ui = await render1('Jan 2020', '2021-01')
            expect(ui.getByText('1y')).toBeInTheDocument()
        })
        it('computes duration from "Mon D, YYYY"', async () => {
            const ui = await render1('Jan 15, 2020', 'Jun 2020')
            expect(ui.getByText('5m')).toBeInTheDocument()
        })
        it('omits duration when under a month or unparseable', async () => {
            const ui = await render1('2020-01-01', '2020-01-20')
            expect(ui.queryByText(/^\d+[ym]/)).not.toBeInTheDocument()
        })
        it('omits duration for unparseable dates but still shows the raw range', async () => {
            const ui = await render1('Spring 2020', '2021')
            expect(ui.getByText('Spring 2020 – 2021')).toBeInTheDocument()
        })
        it('shows only the end date when start is missing', async () => {
            const ui = await render1(null, '2021')
            expect(ui.getByText('2021')).toBeInTheDocument()
        })
    })

    // BUG (c): a failed fetch is swallowed and the spinner is shown forever.
    it('BUG(c): shows an error state (not an endless spinner) when the fetch fails', async () => {
        apiMock.get.mockRejectedValue(apiError(500))
        render(<Welcome />)
        expect(await screen.findByRole('alert')).toBeInTheDocument()
    })
})
