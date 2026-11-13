"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const API = "http://localhost:3001"

export default function ProfilePage() {
    const router = useRouter()
    const [result, setResult] = useState<{ code: number; text: string } | null>(null)

    useEffect(() => {
        fetch(`${API}/profile`, { credentials: "include" })
            .then(async (res) => {
                const data = await res.json()
                if (res.ok) {
                    setResult({ code: res.status, text: `Access granted: ${data.username}` })
                } else {
                    setResult({ code: res.status, text: data.message })
                    setTimeout(() => router.push("/login"), 1500)
                }
            })
            .catch(() => setResult({ code: 0, text: "Cannot reach server" }))
    }, [router])

    return (
        <main className="page">
            <div className="panel">
                <h1>เข้าถึงระบบเรียบร้อย</h1>
                <p className="hint">หน้านี้เข้าได้เฉพาะผู้ที่ผ่าน OTP แล้ว</p>
                {result && (
                    <div className={`status ${result.code === 200 ? "ok" : "err"}`}>
                        {result.code} {result.text}
                    </div>
                )}
            </div>
        </main>
    )
}
