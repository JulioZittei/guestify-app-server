import { MailOptions, MailService } from '@src/services/ports/mail-service'
import transporter from './client'
import { Service } from 'fastify-decorators'
import logger from '@src/logger'

@Service('MailServiceNodeMailer')
class MailServiceNodeMailer implements MailService {
  constructor(private mailService = transporter) {}

  async send(mailOptions: MailOptions): Promise<boolean> {
    try {
      await this.mailService.sendMail(mailOptions)
      logger.info(`Validation email sent to '${mailOptions.to}' successfully`)
      return true
    } catch (error) {
      logger.error(`Email was not sent due an error: ${error}`)
      return false
    }
  }
}

export { MailServiceNodeMailer }
