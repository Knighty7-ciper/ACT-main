import { Injectable, Logger } from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendWelcomeEmail(user: UserEntity): Promise<void> {
    const template = this.getWelcomeEmailTemplate(user);
    await this.sendEmail(user.email, template);
  }

  async sendVerificationEmail(user: UserEntity): Promise<void> {
    const template = this.getVerificationEmailTemplate(user);
    await this.sendEmail(user.email, template);
  }

  async sendEmailConfirmedEmail(user: UserEntity): Promise<void> {
    const template = this.getEmailConfirmedTemplate(user);
    await this.sendEmail(user.email, template);
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    try {
      // Implement actual email sending with Resend API
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ACT Platform <noreply@act-platform.com>',
          to: [to],
          subject: template.subject,
          text: template.text,
          html: template.html,
        }),
      });

      if (!response.ok) {
        throw new Error(`Email sending failed: ${response.statusText}`);
      }

      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  private getWelcomeEmailTemplate(user: UserEntity): EmailTemplate {
    const fullName = `${user.firstName} ${user.lastName || ''}`.trim();
    
    return {
      subject: `Welcome to ACT Platform, ${fullName}!`,
      text: `Welcome to the ACT Platform, ${fullName}!

We're excited to have you join our community. Here's what you can do:

- Trade African Currency Tokens (ACT)
- Send money across African countries
- Access your digital wallets
- Track real-time exchange rates

Your digital wallets have been automatically created for:
- ACT (African Currency Token) - Primary wallet
- NGN (Nigerian Naira)
- KES (Kenyan Shilling)
- ZAR (South African Rand)
- GHS (Ghanaian Cedi)
- USD (US Dollar)

To get started:
1. Verify your email address
2. Complete KYC verification
3. Fund your ACT wallet
4. Start trading!

Need help? Contact our support team.

Best regards,
ACT Platform Team`,
      
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ACT Platform</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">Welcome to ACT Platform!</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px;">Your gateway to African digital currency</p>
  </div>
  
  <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Hello ${fullName}!</h2>
    
    <p>We're excited to have you join our community. Here's what you can do:</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #667eea; margin-top: 0;">Your Digital Wallets</h3>
      <p>Your wallets have been automatically created for:</p>
      <ul style="color: #666;">
        <li><strong>ACT</strong> (African Currency Token) - Primary wallet</li>
        <li><strong>NGN</strong> (Nigerian Naira)</li>
        <li><strong>KES</strong> (Kenyan Shilling)</li>
        <li><strong>ZAR</strong> (South African Rand)</li>
        <li><strong>GHS</strong> (Ghanaian Cedi)</li>
        <li><strong>USD</strong> (US Dollar)</li>
      </ul>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #667eea; margin-top: 0;">Get Started</h3>
      <ol>
        <li>Verify your email address</li>
        <li>Complete KYC verification</li>
        <li>Fund your ACT wallet</li>
        <li>Start trading!</li>
      </ol>
    </div>
    
    <p style="color: #666; margin-top: 30px;">Need help? Contact our support team.</p>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">Access Your Account</a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0 20px 0;">
    <p style="text-align: center; color: #999; font-size: 14px; margin: 0;">
      Best regards,<br>
      <strong>ACT Platform Team</strong>
    </p>
  </div>
</body>
</html>`
    };
  }

  private getVerificationEmailTemplate(user: UserEntity): EmailTemplate {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?userId=${user.id}&token=${user.emailVerificationToken}`;
    const fullName = `${user.firstName} ${user.lastName || ''}`.trim();
    
    return {
      subject: `Verify your ACT Platform email address`,
      text: `Hello ${fullName},

Please verify your email address by clicking the link below:
${verificationLink}

This link will expire in 24 hours.

If you didn't create an account with us, please ignore this email.

Best regards,
ACT Platform Team`,
      
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - ACT Platform</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">Verify Your Email</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px;">Complete your ACT Platform registration</p>
  </div>
  
  <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Hello ${fullName}!</h2>
    
    <p>Thank you for registering with ACT Platform. To complete your registration, please verify your email address by clicking the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">Verify Email Address</a>
    </div>
    
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0; color: #856404;"><strong>Note:</strong> This link will expire in 24 hours.</p>
    </div>
    
    <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="color: #999; font-size: 12px; word-break: break-all;">${verificationLink}</p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0 20px 0;">
    <p style="text-align: center; color: #999; font-size: 14px; margin: 0;">
      If you didn't create an account with us, please ignore this email.<br>
      <strong>ACT Platform Team</strong>
    </p>
  </div>
</body>
</html>`
    };
  }

  private getEmailConfirmedTemplate(user: UserEntity): EmailTemplate {
    const fullName = `${user.firstName} ${user.lastName || ''}`.trim();
    
    return {
      subject: `Email verified successfully - Welcome to ACT Platform!`,
      text: `Hello ${fullName},

Great news! Your email address has been verified successfully.

Your ACT Platform account is now fully activated. You can:

- Access all platform features
- Trade African Currency Tokens
- Send and receive payments
- Manage your digital wallets

What's next:
1. Complete KYC verification for higher transaction limits
2. Fund your ACT wallet with a supported currency
3. Start exploring the platform!

If you have any questions, our support team is here to help.

Welcome to the future of African digital currency!

Best regards,
ACT Platform Team`,
      
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verified - ACT Platform</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">Email Verified!</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px;">Your ACT Platform account is now active</p>
  </div>
  
  <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Hello ${fullName}!</h2>
    
    <p>Great news! Your email address has been verified successfully. Your ACT Platform account is now fully activated!</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #00b894; margin-top: 0;">What's Available Now</h3>
      <ul style="color: #666;">
        <li>Access all platform features</li>
        <li>Trade African Currency Tokens</li>
        <li>Send and receive payments</li>
        <li>Manage your digital wallets</li>
        <li>Real-time exchange rates</li>
      </ul>
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #00b894; margin-top: 0;">What's Next</h3>
      <ol>
        <li>Complete KYC verification for higher transaction limits</li>
        <li>Fund your ACT wallet with a supported currency</li>
        <li>Start exploring the platform!</li>
      </ol>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" style="background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">Access Dashboard</a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0 20px 0;">
    <p style="text-align: center; color: #999; font-size: 14px; margin: 0;">
      If you have any questions, our support team is here to help.<br>
      Welcome to the future of African digital currency!<br>
      <strong>ACT Platform Team</strong>
    </p>
  </div>
</body>
</html>`
    };
  }
}