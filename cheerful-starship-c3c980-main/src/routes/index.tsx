import { createFileRoute, Link } from '@tanstack/react-router'
import { ExternalLink, Lightbulb, LogIn, LogOut, Plus, Send } from 'lucide-react'
import { FormEvent, useEffect, useMemo, useState } from 'react'

type LinkRecord = {
  id: number
  title: string
  url: string
  description: string
  category: string
  submittedBy: string
  isIdea: boolean
  createdAt: string
}

export const Route = createFileRoute('/')({
  component: Home,
})

const emptyLink = {
  title: '',
  url: '',
  description: '',
  category: '',
  submittedBy: '',
}

function Home() {
  const [links, setLinks] = useState<LinkRecord[]>([])
  const [admin, setAdmin] = useState(false)
  const [linkForm, setLinkForm] = useState(emptyLink)
  const [ideaForm, setIdeaForm] = useState(emptyLink)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadLinks() {
    const response = await fetch('/api/links')
    const data = await response.json()
    setLinks(data.links ?? [])
    setAdmin(Boolean(data.admin))
    setLoading(false)
  }

  useEffect(() => {
    loadLinks()
  }, [])

  const categories = useMemo(
    () => [...new Set(links.map((link) => link.category))].filter(Boolean),
    [links],
  )

  async function submitLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    const response = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(linkForm),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(data.message ?? 'The link could not be saved.')
      return
    }
    setLinkForm(emptyLink)
    setMessage('Link saved.')
    await loadLinks()
  }

  async function submitIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    const response = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...ideaForm, isIdea: true, submittedBy: 'Admin' }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(data.message ?? 'The idea could not be saved.')
      return
    }
    setIdeaForm(emptyLink)
    setMessage('Admin idea saved.')
    await loadLinks()
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(data.message ?? 'Login failed.')
      return
    }
    setLoginForm({ username: '', password: '' })
    setMessage('Admin session started.')
    await loadLinks()
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    setAdmin(false)
    setMessage('Admin session ended.')
  }

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#201b16]">
      <section className="mx-auto grid min-h-[82vh] max-w-7xl grid-cols-1 gap-8 px-5 py-6 md:grid-cols-[1.08fr_0.92fr] lg:px-8">
        <div className="flex flex-col justify-between rounded-[2rem] bg-[#1f2a24] p-6 text-[#f8f1df] shadow-2xl shadow-[#2b2115]/20 md:p-10">
          <nav className="flex items-center justify-between gap-4 text-sm">
            <span className="font-semibold uppercase tracking-[0.22em] text-[#c2d076]">
              Link Ledger
            </span>
            <Link
              to="/reviews"
              className="rounded-full border border-[#f8f1df]/30 px-4 py-2 text-[#f8f1df] transition hover:bg-[#f8f1df] hover:text-[#1f2a24]"
            >
              Reviews
            </Link>
          </nav>

          <div className="my-16 max-w-2xl">
            <p className="mb-5 text-sm uppercase tracking-[0.28em] text-[#e78a60]">
              Curated links, quick submissions
            </p>
            <h1 className="font-serif text-5xl leading-[0.95] md:text-7xl">
              A shared place to collect useful links.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#e8ddc4]">
              Visitors can submit links in seconds. Admins can log in, add link
              ideas, and keep the review page tidy.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <Metric label="Links" value={links.length.toString()} />
            <Metric label="Ideas" value={links.filter((link) => link.isIdea).length.toString()} />
            <Metric label="Topics" value={categories.length.toString()} />
          </div>
        </div>

        <div className="grid content-start gap-5">
          <Panel>
            <div className="mb-5 flex items-center gap-3">
              <Plus className="h-5 w-5 text-[#b75b38]" />
              <h2 className="font-serif text-3xl">Upload a link</h2>
            </div>
            <LinkForm
              buttonLabel="Submit link"
              form={linkForm}
              onChange={setLinkForm}
              onSubmit={submitLink}
            />
          </Panel>

          <Panel>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {admin ? (
                  <LogOut className="h-5 w-5 text-[#b75b38]" />
                ) : (
                  <LogIn className="h-5 w-5 text-[#b75b38]" />
                )}
                <h2 className="font-serif text-2xl">Admin</h2>
              </div>
              {admin && (
                <button className="text-sm font-semibold text-[#8b3f27]" onClick={logout}>
                  Sign out
                </button>
              )}
            </div>
            {admin ? (
              <form className="grid gap-3" onSubmit={submitIdea}>
                <p className="text-sm leading-6 text-[#6d6255]">
                  Add a link idea that is labeled separately from visitor submissions.
                </p>
                <LinkFormFields form={ideaForm} onChange={setIdeaForm} />
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f2a24] px-4 py-3 font-semibold text-[#f8f1df]">
                  <Lightbulb className="h-4 w-4" />
                  Save idea
                </button>
              </form>
            ) : (
              <form className="grid gap-3" onSubmit={login}>
                <input
                  className="input"
                  placeholder="Admin username"
                  value={loginForm.username}
                  onChange={(event) =>
                    setLoginForm({ ...loginForm, username: event.target.value })
                  }
                />
                <input
                  className="input"
                  placeholder="Admin password"
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm({ ...loginForm, password: event.target.value })
                  }
                />
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f2a24] px-4 py-3 font-semibold text-[#f8f1df]">
                  <Send className="h-4 w-4" />
                  Log in
                </button>
              </form>
            )}
          </Panel>
          {message && <p className="rounded-xl bg-[#201b16] px-4 py-3 text-[#f8f1df]">{message}</p>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#8b3f27]">Directory</p>
            <h2 className="font-serif text-4xl">Latest links</h2>
          </div>
          {loading && <p className="text-sm text-[#6d6255]">Loading...</p>}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <article key={link.id} className="rounded-2xl border border-[#ded1bd] bg-[#fffaf0] p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#dbe6a4] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#34411d]">
                  {link.isIdea ? 'Admin idea' : link.category}
                </span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${link.title}`}
                  className="rounded-full border border-[#c6b9a3] p-2 transition hover:bg-[#201b16] hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <h3 className="font-serif text-2xl">{link.title}</h3>
              <p className="mt-3 min-h-14 text-sm leading-6 text-[#6d6255]">
                {link.description || 'No description added yet.'}
              </p>
              <p className="mt-5 text-xs uppercase tracking-[0.18em] text-[#9a8064]">
                Submitted by {link.submittedBy}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#f8f1df]/20 bg-[#f8f1df]/10 p-4">
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs uppercase tracking-[0.18em] text-[#d5caa7]">{label}</p>
    </div>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border border-[#ded1bd] bg-[#fffaf0] p-5 shadow-xl shadow-[#7b5e3c]/10">{children}</div>
}

function LinkForm({
  buttonLabel,
  form,
  onChange,
  onSubmit,
}: {
  buttonLabel: string
  form: typeof emptyLink
  onChange: (form: typeof emptyLink) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      <LinkFormFields form={form} onChange={onChange} />
      <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#b75b38] px-4 py-3 font-semibold text-white">
        <Send className="h-4 w-4" />
        {buttonLabel}
      </button>
    </form>
  )
}

function LinkFormFields({
  form,
  onChange,
}: {
  form: typeof emptyLink
  onChange: (form: typeof emptyLink) => void
}) {
  return (
    <>
      <input className="input" placeholder="Title" value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} />
      <input className="input" placeholder="https://example.com" value={form.url} onChange={(event) => onChange({ ...form, url: event.target.value })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="input" placeholder="Category" value={form.category} onChange={(event) => onChange({ ...form, category: event.target.value })} />
        <input className="input" placeholder="Submitted by" value={form.submittedBy} onChange={(event) => onChange({ ...form, submittedBy: event.target.value })} />
      </div>
      <textarea className="input min-h-24 resize-y" placeholder="Short description" value={form.description} onChange={(event) => onChange({ ...form, description: event.target.value })} />
    </>
  )
}

