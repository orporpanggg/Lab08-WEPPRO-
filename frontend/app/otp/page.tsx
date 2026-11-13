"use client"
import { Suspense, useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const API = "http://localhost:3001"

function OtpForm() {
    const router = useRouter()
    const ref = useSearchParams().get("ref") ?? ""
    const [code, setCode] = useState("")
    const [result, setResult] = useState<{ code: number; text: string } | null>(null)
    const [busy, setBusy] = useState(false)

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        setBusy(true)
        try {
            const res = await fetch(`${API}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ ref, otp: code }),
            })
            const data = await res.json()

            if (res.ok) {
                setResult({ code: res.status, text: "OK" })
                setTimeout(() => router.push("/profile"), 800)
            } else {
                setResult({ code: res.status, text: data.message })
                if (!data.canRetry) {
                    setTimeout(() => router.push("/login"), 1500)
                }
            }
        } catch {
            setResult({ code: 0, text: "Cannot reach server" })
        } finally {
            setBusy(false)
        }
    }

    return (
        <main className="page">
            <form className="panel" onSubmit={onSubmit}>
                <h1>กรอกรหัสยืนยัน</h1>
                <p className="hint">รหัสอ้างอิง <span className="ref">{ref}</span></p>

                <label className="field">
                    <span>รหัส 6 หลัก</span>
                    <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        inputMode="numeric" maxLength={6} required
                    />
                </label>

                <button className="btn" disabled={busy}>ยืนยัน</button>

                {result && (
                    <div className={`status ${result.code === 200 ? "ok" : "err"}`}>
                        {result.code} {result.text}
                    </div>
                )}
            </form>
        </main>
    )
}

export default function OtpPage() {
    return (
        <Suspense>
            <OtpForm />
        </Suspense>
    )
}
