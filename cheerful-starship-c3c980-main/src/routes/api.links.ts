import { createFileRoute } from '@tanstack/react-router'
import { desc } from 'drizzle-orm'
import { db } from '../../db'
import { links } from '../../db/schema'
import { getAdminFromRequest } from '../lib/admin-auth'

export const Route = createFileRoute('/api/links')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const admin = await getAdminFromRequest(request)
        const rows = await db.select().from(links).orderBy(desc(links.createdAt))
        return Response.json({ links: rows, admin: Boolean(admin) })
      },
      POST: async ({ request }) => {
        const body = await request.json()
        const url = typeof body.url === 'string' ? body.url.trim() : ''
        const title = typeof body.title === 'string' ? body.title.trim() : ''
        const description =
          typeof body.description === 'string' ? body.description.trim() : ''
        const category =
          typeof body.category === 'string' && body.category.trim()
            ? body.category.trim()
            : 'General'
        const submittedBy =
          typeof body.submittedBy === 'string' && body.submittedBy.trim()
            ? body.submittedBy.trim()
            : 'Visitor'
        const isIdea = Boolean(body.isIdea)

        if (!title || !url) {
          return Response.json(
            { message: 'Title and URL are required.' },
            { status: 400 },
          )
        }

        if (isIdea && !(await getAdminFromRequest(request))) {
          return Response.json({ message: 'Admin login required.' }, { status: 401 })
        }

        try {
          new URL(url)
        } catch {
          return Response.json({ message: 'Enter a valid URL.' }, { status: 400 })
        }

        const [created] = await db
          .insert(links)
          .values({ title, url, description, category, submittedBy, isIdea })
          .returning()

        return Response.json({ link: created }, { status: 201 })
      },
    },
  },
})

