import { adminConfig } from './admin-config'

const encoder = new TextEncoder()

function toBase64Url(bytes: Uint8Array) {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function fromBase64Url(value: string) {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(adminConfig.sessionSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return toBase64Url(new Uint8Array(signature))
}

function parseCookies(header: string | null) {
  return Object.fromEntries(
    (header ?? '')
      .split(';')
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const [name, ...rest] = cookie.split('=')
        return [name, rest.join('=')]
      }),
  )
}

export async function createAdminCookie(username: string) {
  const payload = toBase64Url(encoder.encode(JSON.stringify({ username, iat: Date.now() })))
  const signature = await sign(payload)
  return `${adminConfig.sessionCookieName}=${payload}.${signature}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
}

export function clearAdminCookie() {
  return `${adminConfig.sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

export async function getAdminFromRequest(request: Request) {
  const token = parseCookies(request.headers.get('cookie'))[adminConfig.sessionCookieName]
  if (!token) return null

  const [payload, signature] = token.split('.')
  if (!payload || !signature || (await sign(payload)) !== signature) return null

  try {
    const decoded = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as {
      username?: string
      iat?: number
    }
    if (!decoded.username || typeof decoded.iat !== 'number') return null
    if (Date.now() - decoded.iat > 7 * 24 * 60 * 60 * 1000) return null
    return adminConfig.admins.some((admin) => admin.username === decoded.username)
      ? decoded.username
      : null
  } catch {
    return null
  }
}

export function isValidAdminLogin(username: string, password: string) {
  return adminConfig.admins.some(
    (admin) => admin.username === username && admin.password === password,
  )
}

