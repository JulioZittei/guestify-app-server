import nodeMailer, { Transporter } from 'nodemailer'
import config from 'config'

const transporter: Transporter = nodeMailer.createTransport({
  host: config.get('App.mail.host'),
  port: config.get('App.mail.port'),
  secure: config.get('App.mail.secure'),
  auth: {
    user: config.get('App.mail.auth.user'),
    pass: config.get('App.mail.auth.pass'),
  },
})

export default transporter
