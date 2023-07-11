interface MailOptions {
  from: string
  to: string
  subject: string
  html: string
}

interface MailService {
  send(mailOptions: MailOptions): Promise<boolean>
}

export { MailOptions, MailService }
