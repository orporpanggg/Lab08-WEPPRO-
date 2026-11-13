import { Elysia, t } from "elysia"
import { cors } from "@elysiajs/cors"
import { checkLogin } from "./users"
import { issueOtp, verifyOtp } from "./otp"
import { sendOtpMail } from "./mail"
import { createSession, getSession } from "./session"

new Elysia()
    .use(cors({ origin: "http://localhost:3002", credentials: true }))
    .post(
        "/login",
        async ({ body, set }) => {
            const user = await checkLogin(body.username, body.password)
            if (!user) {
                set.status = 401
                return { status: 401, message: "Login Failed" }
            }
            const { ref, otp } = issueOtp(user.username)
            try {
                await sendOtpMail(user.email, ref, otp)
            } catch (err) {
                console.error(err)
                set.status = 500
                return { status: 500, message: "Cannot send email" }
            }
            return { status: 200, ref }
        },
        { body: t.Object({ username: t.String(), password: t.String() }) }
    )
    .post(
        "/verify-otp",
        ({ body, set, cookie: { sid } }) => {
            const r = verifyOtp(body.ref, body.otp)
            if (!r.ok) {
                set.status = 401
                return { status: 401, message: "Rejected", canRetry: r.reason === "wrong" }
            }
            const id = createSession(r.username)
            sid.set({ value: id, httpOnly: true, sameSite: "lax", path: "/", maxAge: 15 * 60 })
            return { status: 200 }
        },
        { body: t.Object({ ref: t.String(), otp: t.String() }) }
    )
    .get("/profile", ({ set, cookie: { sid } }) => {
        const s = getSession(typeof sid.value === "string" ? sid.value : undefined)
        if (!s) {
            set.status = 401
            return { status: 401, message: "Login Required" }
        }
        return { status: 200, username: s.username }
    })
    .listen(3001)

console.log("Server running on http://localhost:3001")