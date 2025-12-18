import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    try {
      const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify?token=${token}`;
      const subject = 'Email Verification - African Currency Platform';
      const htmlContent = `
        <h2>Verify Your Email</h2>
        <p>Click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `;

      return await this.sendEmail(email, subject, htmlContent);
    } catch (error) {
      this.logger.error('Failed to send verification email', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    try {
      const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
      const subject = 'Password Reset - African Currency Platform';
      const htmlContent = `
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      `;

      return await this.sendEmail(email, subject, htmlContent);
    } catch (error) {
      this.logger.error('Failed to send password reset email', error);
      return false;
    }
  }

  async sendTransactionConfirmation(
    email: string,
    transactionId: string,
    amount: number,
    currency: string,
  ): Promise<boolean> {
    try {
      const subject = 'Transaction Confirmation - African Currency Platform';
      const htmlContent = `
        <h2>Transaction Confirmed</h2>
        <p>Your transaction has been processed successfully.</p>
        <ul>
          <li>Transaction ID: ${transactionId}</li>
          <li>Amount: ${amount} ${currency}</li>
          <li>Date: ${new Date().toLocaleString()}</li>
        </ul>
      `;

      return await this.sendEmail(email, subject, htmlContent);
    } catch (error) {
      this.logger.error('Failed to send transaction confirmation', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    try {
      const subject = 'Welcome to African Currency Platform';
      const htmlContent = `
        <h2>Welcome, ${firstName}!</h2>
        <p>Thank you for joining the African Currency Platform.</p>
        <p>Start trading currencies with confidence today.</p>
      `;

      return await this.sendEmail(email, subject, htmlContent);
    } catch (error) {
      this.logger.error('Failed to send welcome email', error);
      return false;
    }
  }

  private async sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    // Placeholder implementation
    // In production, integrate with email service like SendGrid, Mailgun, AWS SES, etc.
    
    this.logger.log(`Email sent to ${to}: ${subject}`);
    return true;
  }
}
