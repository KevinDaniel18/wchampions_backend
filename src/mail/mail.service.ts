import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'worldchampions125@gmail.com',
        pass: process.env.APP_PASSWORD,
      },
    });
  }

  async welcomeEmail(email: string, fullname: string): Promise<void> {
    const mailOptions = {
      to: email,
      subject: 'Welcome champion!',
      html: `
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f5f5f5;
                  padding: 20px;
                }
                .container {
                  background-color: #fff;
                  border-radius: 8px;
                  padding: 20px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                h1 {
                  color: #333;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Welcome to worldchampions</h1>
                <p>Hi ${fullname},</p>
                <p>You have registered successfully.</p>
              </div>
            </body>
          </html>
        `,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async send2FASetupEmail(email: string, qrCodeUrl: string) {
    const mailOptions = {
      to: email,
      subject: 'Set up your Two-Factor Authentication',
      attachDataUrls: true,
      html: `
      <p>Scan the following QR Code with your 2FA app (such as Google Authenticator or Authy):</p>
      <img src="${qrCodeUrl}" alt="QR Code"/>
      `,
    };
    await this.transporter.sendMail(mailOptions);
  }
}
