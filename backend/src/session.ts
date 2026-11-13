import { randomBytes } from "node:crypto"

type Session = { username: string; expiresAt: number }

const sessions = new Map<string, Session>()
const SESSION_TTL_MS = 15 * 60 * 1000

export function createSession(username: string) {
    const id = randomBytes(32).toString("hex")
    sessions.set(id, { username, expiresAt: Date.now() + SESSION_TTL_MS })
    return id
}

export function getSession(id: string | undefined) {
    if (!id) return null
    const s = sessions.get(id)
    if (!s) return null
    if (Date.now() > s.expiresAt) {
        sessions.delete(id)
        return null
    }
    return s
}