import nodemailer from 'nodemailer'

const send_mail = async(to_email, code) => {

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        // port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
            user: process.env.EMAIL_HOST_USER,
            pass: process.env.EMAIL_HOST_PASSWORD
        }
    })
    
    const details = {
        from: process.env.EMAIL_HOST,
        to: to_email,
        subject: `Your PingPong password reset code is ${code}`,
        text: `Enter this tmp verification code to continue: ${code}`
    }
    
    transporter.sendMail(details, function(err, info) {
        if (err)
            console.log(err)
        else
            console.log(info.response)
    })
}

export default send_mail