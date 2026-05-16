import { createFileRoute } from '@tanstack/react-router'
import { clearAdminCookie } from '../lib/admin-auth'

export const Route = createFileRoute('/api/admin/logout')({
  server: {
    handlers: {
      POST: async () =>
        Response.json(
          { ok: true },
          { headers: { 'Set-Cookie': clearAdminCookie() } },
        ),
    },
  },
})

