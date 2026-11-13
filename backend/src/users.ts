type User = { username: string; passwordHash: string; email: string }

const users: User[] = [
    {
        username: "Phenphichcha",
        passwordHash: await Bun.password.hash("Password123"),
        email: "ppc.opal@gmail.com",
    },
]

export async function checkLogin(username: string, password: string) {
    const u = users.find((x) => x.username === username)
    if (!u) return null
    const ok = await Bun.password.verify(password, u.passwordHash)
    return ok ? u : null
}