import { EventEmitter } from 'events';
import Mail from 'nodemailer/lib/mailer';
import { verifyEmailTemplate } from '../email/template.email';
import { sendEmail } from './send.email';
import { OtpEnum } from 'src/common';

export interface IEmail extends Mail.Options {
  otp: string;
}

export const emailEmitter = new EventEmitter();

emailEmitter.on(OtpEnum.confirmEmail, async (data: IEmail) => {
  try {
    data.subject = OtpEnum.confirmEmail;
    data.html = verifyEmailTemplate(data.otp, data.subject);
    await sendEmail(data);
  } catch (err) {
    console.error('❌ email failed:', err);
  }
});

emailEmitter.on(OtpEnum.forgotPassword, async (data: IEmail) => {
  try {
    data.subject = OtpEnum.forgotPassword;
    data.html = verifyEmailTemplate(data.otp, data.subject);
    await sendEmail(data);
  } catch (err) {
    console.error('❌ email failed:', err);
  }
});
