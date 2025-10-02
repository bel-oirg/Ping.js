import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const htmlTemplate = fs.readFileSync(path.join(__dirname, 'email.html'), 'utf8')

const send_mail = async (to_email, code) => {

    const htmlContent = htmlTemplate
    .replace(/\${code}/g, code)
    .replace(/\${email}/g, encodeURIComponent(to_email));
    const transporter = nodemailer.createTransport({
        host: process.env.HOSTNAME,
        port: 25,
        secure: false,
        auth: {
            user: process.env.EMAIL_HOST_USER,
            pass: process.env.EMAIL_HOST_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });

    const details = {
        from: 'BlackHoleJS <mail@blackholejs.art>',
        to: to_email,
        name: 'BlackHoleJS',
        subject: `Welcome Back to BlackHoleJS! Your Verification Code Was Sent`,
        html: htmlContent
    }
    
    try {
        await transporter.sendMail(details)
        console.log(`Email sent to ${to_email}`)
    } catch (error) {
        console.error('Error sending email:', error)
        throw error
    }
}

export default send_mail