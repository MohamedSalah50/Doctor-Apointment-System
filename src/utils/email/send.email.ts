import { BadRequestException } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

export const sendEmail = async (data: Mail.Options): Promise<void> => {
  if (!data.html && !data.attachments?.length && !data.text) {
    throw new BadRequestException('missing email content');
  }

  const transporter = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    ...data,
    from: `"${process.env.APP_NAME}" <${process.env.EMAIL}>`,
  });

  // console.log('Message sent:', info.messageId);
};
