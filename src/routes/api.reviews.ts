import { createFileRoute } from '@tanstack/react-router'
import { desc, eq } from 'drizzle-orm'
import { db } from '../../db'
import { reviews } from '../../db/schema'
import { getAdminFromRequest } from '../lib/admin-auth'

export const Route = createFileRoute('/api/reviews')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const admin = await getAdminFromRequest(request)
        const rows = await db.select().from(reviews).orderBy(desc(reviews.createdAt))
        return Response.json({ reviews: rows, admin: Boolean(admin) })
      },
      POST: async ({ request }) => {
        const body = await request.json()
        const author = typeof body.author === 'string' ? body.author.trim() : ''
        const review = typeof body.body === 'string' ? body.body.trim() : ''
        const rating = Number(body.rating)

        if (!author || !review || !Number.isInteger(rating) || rating < 1 || rating > 5) {
          return Response.json(
            { message: 'Name, review, and a 1-5 rating are required.' },
            { status: 400 },
          )
        }

        const [created] = await db
          .insert(reviews)
          .values({ author, body: review, rating })
          .returning()

        return Response.json({ review: created }, { status: 201 })
      },
      DELETE: async ({ request }) => {
        if (!(await getAdminFromRequest(request))) {
          return Response.json({ message: 'Admin login required.' }, { status: 401 })
        }

        const url = new URL(request.url)
        const id = Number(url.searchParams.get('id'))
        if (!Number.isInteger(id)) {
          return Response.json({ message: 'Review id is required.' }, { status: 400 })
        }

        await db.delete(reviews).where(eq(reviews.id, id))
        return new Response(null, { status: 204 })
      },
    },
  },
})

