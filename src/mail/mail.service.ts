import { Injectable } from "@nestjs/common"
import { sendMail } from "./mailer"

@Injectable()
export class MailService {
    send(params: { to: string; subject: string; mjml: string }): Promise<void> {
        return sendMail(params)
    }
}
