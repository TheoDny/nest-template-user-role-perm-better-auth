import mjml2html from "mjml"
import nodemailer from "nodemailer"
import { buildEmailOtpMjml } from "./templates/email-otp.template"
import { buildInvitationMjml } from "./templates/invitation.template"

type MailParams = {
    to: string
    subject: string
    mjml: string
}

type BetterAuthInvitationEmailParams = {
    id: string
    role: string
    email: string
    organization: {
        name: string
    }
    invitation: {
        expiresAt?: Date
    }
    inviter: {
        user: {
            name: string
            email: string
        }
    }
}

export async function sendInvitationEmail(params: BetterAuthInvitationEmailParams): Promise<void> {
    const appPublicUrl = process.env.APP_PUBLIC_URL ?? "http://localhost:5173"
    const inviteLink = `${appPublicUrl.replace(/\/$/, "")}/invitations/${params.id}`

    await sendMail({
        to: params.email,
        subject: `Invitation to join ${params.organization.name}`,
        mjml: buildInvitationMjml({
            organizationName: params.organization.name,
            inviterName: params.inviter.user.name,
            inviterEmail: params.inviter.user.email,
            role: params.role,
            inviteLink,
            expiresAt: params.invitation.expiresAt,
        }),
    })
}

export async function sendVerificationOtpEmail(params: {
    email: string
    otp: string
    type: string
}): Promise<void> {
    await sendMail({
        to: params.email,
        subject: "Your verification code",
        mjml: buildEmailOtpMjml({
            otp: params.otp,
            type: params.type,
        }),
    })
}

export async function sendMail(params: MailParams): Promise<void> {
    const html = await renderMjml(params.mjml)
    const smtpPort = Number(process.env.SMTP_PORT ?? 1025)
    const smtpUser = process.env.SMTP_USER
    const smtpPassword = process.env.SMTP_PASSWORD
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST ?? "localhost",
        port: smtpPort,
        secure: smtpPort === 465,
        auth: smtpUser
            ? {
                  user: smtpUser,
                  pass: smtpPassword,
              }
            : undefined,
    })

    await transporter.sendMail({
        from: process.env.SMTP_FROM ?? "no-reply@example.com",
        to: params.to,
        subject: params.subject,
        html,
    })
}

async function renderMjml(template: string): Promise<string> {
    const result = await mjml2html(template, {
        validationLevel: "soft",
    })

    return result.html
}
