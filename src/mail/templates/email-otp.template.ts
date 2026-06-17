export function buildEmailOtpMjml(params: { otp: string; type: string }): string {
    return `
<mjml>
    <mj-body background-color="#f6f8fb">
        <mj-section background-color="#ffffff" padding="32px">
            <mj-column>
                <mj-text font-size="22px" font-weight="700" color="#111827">
                    Your verification code
                </mj-text>
                <mj-text font-size="15px" color="#374151" line-height="1.6">
                    Use this code to continue your ${params.type} flow.
                </mj-text>
                <mj-text font-size="32px" font-weight="700" color="#111827" letter-spacing="4px">
                    ${params.otp}
                </mj-text>
            </mj-column>
        </mj-section>
    </mj-body>
</mjml>`
}
