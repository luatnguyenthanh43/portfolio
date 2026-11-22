import { screen, waitFor, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import Dashboard from '@/Pages/Dashboard'
import { renderWithProviders } from '@/test/utils'
import { apiMock, apiError, resetApiMock } from '@/test/mockApi'

vi.mock('@/lib/api', async () => {
    const m = await import('@/test/mockApi')
    return { default: m.apiMock, getCsrfCookie: m.getCsrfCookie }
})

const USER = { id: 1, name: 'Ada', email: 'a@b.io' }
const base = () => ({
    profile: { name: 'Ada L', title: 'Eng', bio: '<p>bio</p>', email: 'a@b.io', phone: null, location: null, github_url: null, linkedin_url: null },
    projects: [{ id: 1, title: 'Alpha', description: null, tech_stack: ['React'], company: null, role: null, summary: null, demo_url: null, github_url: null, image_url: null }],
    skills: [{ id: 1, name: 'PHP', category: 'Backend', order: 0 }, { id: 2, name: 'Go', category: null, order: 1 }, { id: 3, name: 'JS', category: 'Frontend', order: 2 }],
    experiences: [
        { id: 1, role: 'Dev', company: 'Acme', start_date: 'Jan 15, 2020', end_date: 'Mar 2022', description: null, location: null, employment_type: null, tech_stack: null, key_achievements: null, order: 0 },
        { id: 2, role: 'Lead', company: 'Beta', start_date: 'Spring 2022', end_date: null, description: null, location: null, employment_type: null, tech_stack: null, key_achievements: null, order: 1 },
    ],
    educations: [
        { id: 1, institution: 'MIT', degree: 'BSc', field_of_study: null, start_date: 'Sep 2010', end_date: null, gpa: null, description: null, order: 0 },
        { id: 2, institution: 'Stanford', degree: null, field_of_study: 'CS', start_date: null, end_date: null, gpa: '3.9', description: null, order: 1 },
    ],
    certifications: [
        { id: 1, title: 'AWS', issuer: 'Amazon', issue_date: 'Jun 2021', credential_url: null, description: null, image_url: null },
        { id: 2, title: 'GCP', issuer: null, issue_date: null, credential_url: null, description: null, image_url: null },
    ],
})

let server
const setup = async (tab) => {
    const utils = renderWithProviders(<Dashboard />, { user: USER, route: '/dashboard' })
    if (tab) await userEvent.click(screen.getByRole('button', { name: tab }))
    return utils
}
const field = (label) => screen.getByText(label, { selector: 'label' }).parentElement.querySelector('input,select')
const drag = (fromText, toText) => {
    const from = screen.getByText(fromText).closest('[draggable]')
    const to = screen.getByText(toText).closest('[draggable]')
    fireEvent.dragStart(from)
    fireEvent.dragOver(to)
    fireEvent.drop(to)
}

beforeEach(() => {
    resetApiMock()
    server = base()
    apiMock.get.mockImplementation(() => Promise.resolve({ data: JSON.parse(JSON.stringify(server)) }))
    vi.spyOn(window, 'confirm').mockReturnValue(true)
})
afterEach(() => vi.restoreAllMocks())

describe('Dashboard tabs', () => {
    it('starts on Profile and switches tabs', async () => {
        await setup()
        expect(screen.getByRole('heading', { level: 3, name: 'Profile' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Profile' })).toHaveAttribute('aria-current', 'page')
        await userEvent.click(screen.getByRole('button', { name: 'Skills' }))
        expect(screen.getByRole('heading', { level: 3, name: 'Skills' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Skills' })).toHaveAttribute('aria-current', 'page')
        expect(await screen.findByText('PHP')).toBeInTheDocument()
    })

    it('offers all six sections', async () => {
        await setup()
        const nav = screen.getByRole('navigation', { name: 'Content sections' })
        expect(within(nav).getAllByRole('button').map(b => b.textContent)).toEqual(['Profile', 'Projects', 'Skills', 'Experience', 'Education', 'Certification'])
    })
})

describe('Profile manager', () => {
    it('loads the profile and PUTs edits to /portfolio/profile', async () => {
        await setup()
        await waitFor(() => expect(field('Name')).toHaveValue('Ada L'))
        await userEvent.clear(field('Name'))
        await userEvent.type(field('Name'), 'Grace')
        await userEvent.click(screen.getByRole('button', { name: 'Save Profile' }))
        await waitFor(() => expect(apiMock.put).toHaveBeenCalledWith('/portfolio/profile', expect.objectContaining({ name: 'Grace', title: 'Eng', phone: '' })))
        expect(await screen.findByText('Profile saved successfully.')).toBeInTheDocument()
    })

    it('shows an error toast when saving fails', async () => {
        apiMock.put.mockRejectedValue(apiError(500))
        await setup()
        await waitFor(() => expect(field('Name')).toHaveValue('Ada L'))
        await userEvent.click(screen.getByRole('button', { name: 'Save Profile' }))
        expect(await screen.findByText('Failed to save profile.')).toBeInTheDocument()
    })

    it('regression: null API fields keep inputs controlled (no React warning)', async () => {
        const err = vi.spyOn(console, 'error').mockImplementation(() => {})
        await setup()
        await waitFor(() => expect(field('Name')).toHaveValue('Ada L'))
        expect(field('Phone')).toHaveValue('')
        expect(field('Location')).toHaveValue('')
        await userEvent.type(field('Phone'), '123')
        expect(field('Phone')).toHaveValue('123')
        const warned = err.mock.calls.some(c => /uncontrolled|controlled/i.test(String(c[0])))
        expect(warned).toBe(false)
    })
})

describe('Projects manager', () => {
    it('lists items with tech tags', async () => {
        await setup('Projects')
        expect(await screen.findByText('Alpha')).toBeInTheDocument()
        expect(screen.getByText('React')).toBeInTheDocument()
    })

    it('shows empty state', async () => {
        server.projects = []
        await setup('Projects')
        expect(await screen.findByText('No projects yet.')).toBeInTheDocument()
    })

    it('creates a project via POST /portfolio/projects and reloads', async () => {
        await setup('Projects')
        await screen.findByText('Alpha')
        await userEvent.click(screen.getByRole('button', { name: '+ Add Project' }))
        await userEvent.type(field('Title *'), 'New')
        await userEvent.type(screen.getByPlaceholderText('e.g. React'), 'Vue{Enter}')
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))
        await waitFor(() => expect(apiMock.post).toHaveBeenCalledWith('/portfolio/projects', expect.objectContaining({ title: 'New', tech_stack: ['Vue'] })))
        expect(await screen.findByText('Project added.')).toBeInTheDocument()
        expect(apiMock.get.mock.calls.length).toBeGreaterThanOrEqual(2)
    })

    it('edits a project via PUT /portfolio/projects/:id with null fields kept controlled', async () => {
        const err = vi.spyOn(console, 'error').mockImplementation(() => {})
        await setup('Projects')
        await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
        expect(field('Company')).toHaveValue('')
        await userEvent.clear(field('Title *'))
        await userEvent.type(field('Title *'), 'Alpha2')
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))
        await waitFor(() => expect(apiMock.put).toHaveBeenCalledWith('/portfolio/projects/1', expect.objectContaining({ title: 'Alpha2' })))
        expect(err.mock.calls.some(c => /controlled/i.test(String(c[0])))).toBe(false)
    })

    it('deletes after confirmation', async () => {
        await setup('Projects')
        await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
        await waitFor(() => expect(apiMock.delete).toHaveBeenCalledWith('/portfolio/projects/1'))
        expect(await screen.findByText('Project deleted.')).toBeInTheDocument()
    })

    it('does not delete when confirmation is declined', async () => {
        window.confirm.mockReturnValue(false)
        await setup('Projects')
        await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
        expect(apiMock.delete).not.toHaveBeenCalled()
    })

    it('shows an error toast when delete fails', async () => {
        apiMock.delete.mockRejectedValue(apiError(500))
        await setup('Projects')
        await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
        expect(await screen.findByText('Failed to delete project.')).toBeInTheDocument()
    })

    // BUG (b-adjacent): the API's 422 `errors` are discarded; the user only sees a generic toast.
    it('BUG(b): 422 validation messages from the API are shown to the user', async () => {
        apiMock.post.mockRejectedValue(apiError(422, { message: 'invalid', errors: { demo_url: ['The demo url field must be a valid URL.'] } }))
        await setup('Projects')
        await screen.findByText('Alpha')
        await userEvent.click(screen.getByRole('button', { name: '+ Add Project' }))
        await userEvent.type(field('Title *'), 'New')
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))
        expect(await screen.findByText(/valid URL/)).toBeInTheDocument()
    })

    it('a failed create keeps the form open and shows the generic error toast', async () => {
        apiMock.post.mockRejectedValue(apiError(422, { errors: { title: ['x'] } }))
        await setup('Projects')
        await screen.findByText('Alpha')
        await userEvent.click(screen.getByRole('button', { name: '+ Add Project' }))
        await userEvent.type(field('Title *'), 'New')
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))
        expect(await screen.findByText('Failed to add project.')).toBeInTheDocument()
        expect(field('Title *')).toHaveValue('New')
    })
})

describe('Skills manager', () => {
    it('lists skills with categories', async () => {
        await setup('Skills')
        expect(await screen.findByText('PHP')).toBeInTheDocument()
        expect(screen.getByText('Backend')).toBeInTheDocument()
    })

    it('creates a skill', async () => {
        await setup('Skills')
        await screen.findByText('PHP')
        await userEvent.click(screen.getByRole('button', { name: '+ Add Skill' }))
        await userEvent.type(field('Name *'), 'Rust')
        await userEvent.type(field('Category'), 'Systems')
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))
        await waitFor(() => expect(apiMock.post).toHaveBeenCalledWith('/portfolio/skills', { name: 'Rust', category: 'Systems', order: 0 }))
    })

    it('edits and deletes a skill with the right endpoints', async () => {
        await setup('Skills')
        await screen.findByText('PHP')
        await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0])
        await userEvent.clear(field('Name *'))
        await userEvent.type(field('Name *'), 'PHP8')
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))
        await waitFor(() => expect(apiMock.put).toHaveBeenCalledWith('/portfolio/skills/1', expect.objectContaining({ name: 'PHP8' })))
        await userEvent.click((await screen.findAllByRole('button', { name: 'Del' }))[1])
        await waitFor(() => expect(apiMock.delete).toHaveBeenCalledWith('/portfolio/skills/2'))
    })

    it('reorders by drag and drop via POST /portfolio/skills/reorder', async () => {
        await setup('Skills')
        await screen.findByText('PHP')
        drag('PHP', 'JS')
        await waitFor(() => expect(apiMock.post).toHaveBeenCalledWith('/portfolio/skills/reorder', {
            items: [{ id: 2, order: 0 }, { id: 3, order: 1 }, { id: 1, order: 2 }],
        }))
        expect(await screen.findByText('Order saved.')).toBeInTheDocument()
    })

    it('rolls back to the server order and shows an error when reorder fails', async () => {
        apiMock.post.mockRejectedValue(apiError(500))
        await setup('Skills')
        await screen.findByText('PHP')
        drag('PHP', 'JS')
        expect(await screen.findByText('Failed to save order.')).toBeInTheDocument()
        await waitFor(() => {
            const names = screen.getAllByText(/^(PHP|Go|JS)$/).map(e => e.textContent)
            expect(names).toEqual(['PHP', 'Go', 'JS'])
        })
        expect(apiMock.get.mock.calls.length).toBeGreaterThanOrEqual(2)
    })

    it('dropping on itself does not call reorder', async () => {
        await setup('Skills')
        await screen.findByText('PHP')
        drag('PHP', 'PHP')
        expect(apiMock.post).not.toHaveBeenCalled()
    })
})

describe('Experience manager', () => {
    it('lists experiences with formatted date ranges', async () => {
        await setup('Experience')
        expect(await screen.findByText(/Dev/)).toBeInTheDocument()
        expect(screen.getByText('Jan 15, 2020 — Mar 2022')).toBeInTheDocument()
        expect(screen.getByText('Spring 2022 — Present')).toBeInTheDocument()
    })

    it('toDateInput/fmtDate round-trip: "Jan 15, 2020" and "Mar 2022" survive an unchanged edit', async () => {
        await setup('Experience')
        await userEvent.click((await screen.findAllByRole('button', { name: 'Edit' }))[0])
        expect(field('Start Date')).toHaveValue('2020-01-15')
        expect(field('End Date (blank = Present)')).toHaveValue('2022-03-01')
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))
        await waitFor(() => expect(apiMock.put).toHaveBeenCalledWith('/portfolio/experiences/1',
            expect.objectContaining({ start_date: 'Jan 15, 2020', end_date: 'Mar 2022' })))
    })

    it('picking a date through the date input formats it for the API', async () => {
        await setup('Experience')
        await screen.findByText(/Dev/)
        await userEvent.click(screen.getByRole('button', { name: '+ Add Experience' }))
        await userEvent.type(field('Company *'), 'C')
        await userEvent.type(field('Role *'), 'R')
        fireEvent.change(field('Start Date'), { target: { value: '2021-05-01' } })
        fireEvent.change(field('End Date (blank = Present)'), { target: { value: '2021-06-09' } })
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))
        await waitFor(() => expect(apiMock.post).toHaveBeenCalledWith('/portfolio/experiences',
            expect.objectContaining({ start_date: 'May 2021', end_date: 'Jun 9, 2021' })))
    })

    // BUG (f): toDateInput() returns '' for formats it can't parse, so saving an untouched edit
    // overwrites the stored value with an empty string.
    it('BUG(f): an unparseable stored date is preserved when saving an unrelated edit', async () => {
        await setup('Experience')
        await userEvent.click((await screen.findAllByRole('button', { name: 'Edit' }))[1])
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))
        await waitFor(() => expect(apiMock.put).toHaveBeenCalledWith('/portfolio/experiences/2',
            expect.objectContaining({ start_date: 'Spring 2022' })))
    })

    it('creates, deletes, and reorders', async () => {
        await setup('Experience')
        await screen.findByText(/Dev/)
        drag('Dev', 'Lead')
        await waitFor(() => expect(apiMock.post).toHaveBeenCalledWith('/portfolio/experiences/reorder', { items: [{ id: 2, order: 0 }, { id: 1, order: 1 }] }))
        await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0])
        await waitFor(() => expect(apiMock.delete).toHaveBeenCalledWith(expect.stringMatching(/^\/portfolio\/experiences\/\d$/)))
    })

    it('rolls back on reorder failure', async () => {
        apiMock.post.mockRejectedValue(apiError(500))
        await setup('Experience')
        await screen.findByText(/Dev/)
        drag('Dev', 'Lead')
        expect(await screen.findByText('Failed to save order.')).toBeInTheDocument()
        await waitFor(() => {
            const rows = screen.getAllByText(/@ (Acme|Beta)/).map(e => e.textContent)
            expect(rows).toEqual(['@ Acme', '@ Beta'])
        })
    })

    it('keeps null fields controlled in the edit form', async () => {
        const err = vi.spyOn(console, 'error').mockImplementation(() => {})
        await setup('Experience')
        await userEvent.click((await screen.findAllByRole('button', { name: 'Edit' }))[0])
        expect(field('Location')).toHaveValue('')
        expect(field('Employment Type')).toHaveValue('')
        expect(err.mock.calls.some(c => /controlled/i.test(String(c[0])))).toBe(false)
    })
})

describe('Education manager', () => {
    it('lists educations', async () => {
        await setup('Education')
        expect(await screen.findByText('MIT')).toBeInTheDocument()
        expect(screen.getByText('BSc')).toBeInTheDocument()
        expect(screen.getByText('Sep 2010 — Present')).toBeInTheDocument()
        expect(screen.getByText(/GPA 3.9/)).toBeInTheDocument()
        expect(screen.getByText('No dates')).toBeInTheDocument()
    })

    it('creates, edits and deletes via the education endpoints', async () => {
        await setup('Education')
        await screen.findByText('MIT')
        await userEvent.click(screen.getByRole('button', { name: '+ Add Education' }))
        await userEvent.type(field('Institution *'), 'Harvard')
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))
        await waitFor(() => expect(apiMock.post).toHaveBeenCalledWith('/portfolio/educations', expect.objectContaining({ institution: 'Harvard' })))

        await userEvent.click((await screen.findAllByRole('button', { name: 'Edit' }))[0])
        expect(field('Start Date')).toHaveValue('2010-09-01')
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))
        await waitFor(() => expect(apiMock.put).toHaveBeenCalledWith('/portfolio/educations/1', expect.objectContaining({ institution: 'MIT', start_date: 'Sep 2010', field_of_study: '' })))

        await userEvent.click((await screen.findAllByRole('button', { name: 'Delete' }))[1])
        await waitFor(() => expect(apiMock.delete).toHaveBeenCalledWith('/portfolio/educations/2'))
    })

    it('reorders via POST /portfolio/educations/reorder and rolls back on failure', async () => {
        await setup('Education')
        await screen.findByText('MIT')
        drag('MIT', 'Stanford')
        await waitFor(() => expect(apiMock.post).toHaveBeenCalledWith('/portfolio/educations/reorder', { items: [{ id: 2, order: 0 }, { id: 1, order: 1 }] }))
        apiMock.post.mockRejectedValue(apiError(500))
        drag('Stanford', 'MIT')
        expect(await screen.findByText('Failed to save order.')).toBeInTheDocument()
    })
})

describe('Certification manager', () => {
    it('lists certifications', async () => {
        await setup('Certification')
        expect(await screen.findByText('AWS')).toBeInTheDocument()
        expect(screen.getByText('Amazon')).toBeInTheDocument()
        expect(screen.getByText('Jun 2021')).toBeInTheDocument()
    })

    it('creates with FormData to /portfolio/certifications', async () => {
        await setup('Certification')
        await screen.findByText('AWS')
        await userEvent.click(screen.getByRole('button', { name: '+ Add Certification' }))
        await userEvent.type(field('Title *'), 'CKA')
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))
        await waitFor(() => expect(apiMock.post).toHaveBeenCalled())
        const [url, fd] = apiMock.post.mock.calls[0]
        expect(url).toBe('/portfolio/certifications')
        expect(fd).toBeInstanceOf(FormData)
        expect(fd.get('title')).toBe('CKA')
    })

    it('updates with POST + _method=PUT (multipart)', async () => {
        await setup('Certification')
        await userEvent.click((await screen.findAllByRole('button', { name: 'Edit' }))[0])
        await userEvent.click(screen.getByRole('button', { name: 'Save' }))
        await waitFor(() => expect(apiMock.post).toHaveBeenCalled())
        const [url, fd] = apiMock.post.mock.calls[0]
        expect(url).toBe('/portfolio/certifications/1')
        expect(fd.get('_method')).toBe('PUT')
        expect(fd.get('issue_date')).toBe('Jun 2021')
    })

    it('deletes and reorders', async () => {
        await setup('Certification')
        await screen.findByText('AWS')
        drag('AWS', 'GCP')
        await waitFor(() => expect(apiMock.post).toHaveBeenCalledWith('/portfolio/certifications/reorder', { items: [{ id: 2, order: 0 }, { id: 1, order: 1 }] }))
        await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0])
        await waitFor(() => expect(apiMock.delete).toHaveBeenCalledWith(expect.stringMatching(/^\/portfolio\/certifications\/\d$/)))
    })
})
