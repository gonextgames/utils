import nodemailer from 'nodemailer';

const GONEXTGAMES_EMAIL = process.env.GONEXTGAMES_EMAIL;
const GONEXTGAMES_EMAIL_PASSWORD = process.env.GONEXTGAMES_EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GONEXTGAMES_EMAIL,
    pass: GONEXTGAMES_EMAIL_PASSWORD
  }
});

export async function sendEmail({ to, subject, html, unsubscribeToken }) {
  try {
    var finalHtml = html;
    if (unsubscribeToken) {
        const footer = `<p style="font-size: 12px; color: #666;">
        Our mailing address: 801 W 5th Street Unit 1210, Austin, TX 78703<br>
        To unsubscribe, <a href="https://templative.net/waitlist/unsubscribe?email=${to}&token=${unsubscribeToken}">click here</a>.</p>`;
        finalHtml += footer;
    }

    const plaintext = finalHtml
      .replace(/<br\/?>/g, '\n')
      .replace(/<\/p>/g, '\n')
      .replace(/<[^>]*>/g, '')
      .trim()

    const mailOptions = {
      from: GONEXTGAMES_EMAIL,
      to,
      subject,
      text: plaintext,
      html: finalHtml || plaintext
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
