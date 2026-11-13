import { randomInt } from "node:crypto"

type OtpRecord = {
    username: string
    otp: string
    expiresAt: number
    tries: number
    used: boolean
}

const records = new Map<string, OtpRecord>()
const TTL_MS = 5 * 60 * 1000
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"

function makeTicket(length = 4) {
    let ticket = ""
    for (let i = 0; i < length; i++) {
        ticket += ALPHABET[randomInt(0, ALPHABET.length)]
    }
    return ticket
}

export function issueOtp(username: string) {
    const otp = String(randomInt(0, 1_000_000)).padStart(6, "0")
    let ref = makeTicket()
    while (records.has(ref)) {
        ref = makeTicket()
    }
    records.set(ref, { username, otp, expiresAt: Date.now() + TTL_MS, tries: 0, used: false })
    return { ref, otp }
}

type OtpResult =
    | { ok: true; username: string }
    | { ok: false; reason: "not_found" | "expired" | "locked" | "wrong" }

const MAX_TRIES = 3

export function verifyOtp(ref: string, otp: string): OtpResult {
    const r = records.get(ref)
    if (!r || r.used) return { ok: false, reason: "not_found" }

    if (Date.now() > r.expiresAt) {
        records.delete(ref)
        return { ok: false, reason: "expired" }
    }

    if (r.otp !== otp) {
        r.tries++
        if (r.tries >= MAX_TRIES) {
            records.delete(ref)
            return { ok: false, reason: "locked" }
        }
        return { ok: false, reason: "wrong" }
    }

    r.used = true
    return { ok: true, username: r.username }
}