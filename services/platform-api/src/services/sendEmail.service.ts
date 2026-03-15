import { transporter } from "../utils/nodemailerTransporter.util";

export async function sendVerificationEmail(to: string, token: string) {
  const mailOptions = {
    from: `"Feet fascination" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify Your Email",
    html: `<p>Hello,</p>
           <p>Your verification code is: <b>${token}</b></p>
           <p>This code will expire in 24 hours.</p>`,
  };

  await transporter.sendMail(mailOptions);
}
