export function buildInvitationMjml(params: {
    organizationName: string
    inviterName: string
    inviterEmail: string
    role: string
    inviteLink: string
    expiresAt?: Date
}): string {
    const expiresAt = params.expiresAt ? params.expiresAt.toISOString() : "No expiration date provided"

    return `
<mjml>
    <mj-body background-color="#f6f8fb">
        <mj-section background-color="#ffffff" padding="32px">
            <mj-column>
                <mj-text font-size="22px" font-weight="700" color="#111827">
                    Invitation to join ${params.organizationName}
                </mj-text>
                <mj-text font-size="15px" color="#374151" line-height="1.6">
                    ${params.inviterName} (${params.inviterEmail}) invited you to join ${params.organizationName}
                    with the following role(s): ${params.role}.
                </mj-text>
                <mj-button href="${params.inviteLink}" background-color="#2563eb" color="#ffffff">
                    View invitation
                </mj-button>
                <mj-text font-size="13px" color="#6b7280">
                    Expires at: ${expiresAt}
                </mj-text>
            </mj-column>
        </mj-section>
    </mj-body>
</mjml>`
}
