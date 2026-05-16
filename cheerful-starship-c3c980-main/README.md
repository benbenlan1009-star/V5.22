# Link Ledger

Link Ledger is a TanStack Start site for collecting useful links and visitor reviews. Visitors can submit links and reviews, while admins can sign in to add separate link ideas and remove reviews.

## Key Technologies

- TanStack Start and TanStack Router for the React application and API routes
- React 19 for the user interface
- Tailwind CSS 4 plus local CSS tokens for styling
- Netlify Database with Drizzle ORM for persisted links and reviews
- Lucide React for interface icons

## Admin Configuration

Admin access is configured in `src/lib/admin-config.ts`. Update the admin username, password, and session secret there, or provide `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` environment variables in Netlify.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

For local Netlify feature emulation, use:

```bash
netlify dev
```

The production build command is:

```bash
npm run build
```

