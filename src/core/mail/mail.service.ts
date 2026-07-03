import { Inject, Injectable, Logger } from '@nestjs/common';
import appConfigType from '@/core/config/type';
import type { AppConfig } from '@/core/config/type';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private readonly defaultFrom: string;

  constructor(
    @Inject(appConfigType.KEY)
    private readonly config: AppConfig,
  ) {
    const apiKey = this.config.mail.resend.apiKey;
    this.resend = new Resend(apiKey);
    this.defaultFrom = this.config.mail.from;
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }): Promise<void> {
    this.throwIfDisabled();

    const { to, subject, html, from = this.defaultFrom } = options;

    const { error } = await this.resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error(`Mail delivery failed: ${error.message}`);
    }

    this.logger.log(`Email sent to ${to} — subject: "${subject}"`);
  }

  private throwIfDisabled(): void {
    if (this.config.mail.resend.disabled) {
      this.logger.warn(`Mail sending is disabled — skipping mail operation.`);
      throw new Error('Mail sending is disabled');
    }

    if (!this.config.mail.resend.apiKey) {
      this.logger.error(
        `Mail sending is enabled but RESEND_API_KEY is not set.`,
      );
      throw new Error('Mail sending is enabled but API key is missing');
    }
  }
}
