"use client"
import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

const API = "http://localhost:3001"

export default function LoginPage() {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [result, setResult] = useState<{ code: number; text: string } | null>(null)
    const [busy, setBusy] = useState(false)

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        setBusy(true)
        try {
            const res = await fetch(`${API}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            })
            const data = await res.json()
            if (res.ok) {
                setResult({ code: res.status, text: "OK" })
                setTimeout(() => router.push(`/otp?ref=${data.ref}`), 800)
            } else {
                setResult({ code: res.status, text: data.message })
            }
        } catch (err) {
            console.error(err)
            setResult({ code: 0, text: "Cannot reach server" })
        } finally {
            setBusy(false)
        }
    }

    return (
        <main className="page">
            <form className="panel" onSubmit={onSubmit}>
                <h1>เข้าสู่ระบบ</h1>
                <p className="hint">กรอกชื่อผู้ใช้และรหัสผ่าน</p>

                <label className="field">
                    <span>Username</span>
                    <input value={username} onChange={(e) => setUsername(e.target.value)} required />
                </label>

                <label className="field">
                    <span>รหัสผ่าน</span>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>

                <button className="btn" disabled={busy}>เข้าสู่ระบบ</button>

                {result && (
                    <div className={`status ${result.code === 200 ? "ok" : "err"}`}>
                        {result.code} {result.text}
                    </div>
                )}
            </form>
        </main>
    )
}