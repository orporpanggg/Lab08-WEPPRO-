import nodemailer, { type Transporter } from "nodemailer"
let transporter: Transporter | null = null

async function getTransporter() {
    if (transporter) return transporter
    const port = Number(process.env.SMTP_PORT)
    const options = {
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        family: 4,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    }
    transporter = nodemailer.createTransport(options)
    return transporter
}

export async function sendOtpMail(to: string, ref: string, otp: string) {
    const t = await getTransporter()
    const info = await t.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: `OTP for ${ref}`,
        text: `Ref: ${ref}\nYour OTP is ${otp}\nExpires in 5 minutes.`,
    })
    console.log("Mail sent:", info.messageId)
}