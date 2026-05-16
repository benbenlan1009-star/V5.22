import { createFileRoute } from '@tanstack/react-router'
import { createAdminCookie, isValidAdminLogin } from '../lib/admin-auth'

export const Route = createFileRoute('/api/admin/login')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json()
        const username = typeof body.username === 'string' ? body.username : ''
        const password = typeof body.password === 'string' ? body.password : ''

        if (!isValidAdminLogin(username, password)) {
          return Response.json({ message: 'Invalid admin credentials.' }, { status: 401 })
        }

        return Response.json(
          { ok: true },
          { headers: { 'Set-Cookie': await createAdminCookie(username) } },
        )
      },
    },
  },
})

