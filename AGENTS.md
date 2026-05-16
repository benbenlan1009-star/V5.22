# AGENTS.md

This project is Link Ledger, a TanStack Start application deployed on Netlify. It lets visitors submit useful links and reviews, and lets configured admins add link ideas and remove reviews.

## Architecture

- `src/routes/index.tsx` contains the link directory, public link submission form, admin login form, and admin-only link idea form.
- `src/routes/reviews.tsx` contains the review submission page and admin-only review removal controls.
- `src/routes/api.links.ts`, `src/routes/api.reviews.ts`, `src/routes/api.admin.login.ts`, and `src/routes/api.admin.logout.ts` are TanStack Start API routes.
- `src/lib/admin-config.ts` is the simple admin configuration file. Credentials can also come from Netlify environment variables.
- `src/lib/admin-auth.ts` creates and validates the HTTP-only admin session cookie.
- `db/schema.ts` defines the Drizzle schema for Netlify Database.
- `db/index.ts` initializes the Netlify Database Drizzle client.
- `netlify/database/migrations/` contains SQL migrations that Netlify applies on deploy.

## Data Storage

Persisted application data uses Netlify Database with Drizzle ORM. Links and reviews must not be stored in local files or in-memory objects because submissions need to survive deployments and server restarts.

## Coding Conventions

- Use TypeScript with strict mode.
- Prefer TanStack Start file routes for pages and API endpoints.
- Keep admin-only mutations guarded with `getAdminFromRequest`.
- Keep form validation on both the client and API route where data is persisted.
- Use `@/` imports for app code when convenient, and relative imports for root-level database modules if they are clearer.
- Do not print configured admin credentials or session secrets in logs, summaries, or output files.

## Non-Obvious Decisions

Admin login is intentionally configured through `src/lib/admin-config.ts` for easy setup. Production deployments should set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in Netlify environment variables so sensitive values do not need to be edited into source control.

The review page reads the admin session from the API response. When an admin is signed in on the home page, the review page automatically exposes delete controls without requiring a second login form.

