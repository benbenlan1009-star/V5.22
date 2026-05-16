export type AdminUser = {
  username: string
  password: string
}

export const adminConfig = {
  siteName: 'Link Ledger',
  sessionCookieName: 'link_ledger_admin',
  sessionSecret:
    process.env.ADMIN_SESSION_SECRET ?? 'replace-this-session-secret',
  admins: [
    {
      username: 'ADMINBEN',
      password: 'BEN',
    },
  ] satisfies AdminUser[],
}

