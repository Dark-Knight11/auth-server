import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { IEmailConfig } from 'src/config/interface';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ITemplates, ITemplateData } from './interfaces';
import Handlebars from 'handlebars';
import { User } from '@prisma/client';

/**
 * Service responsible for sending emails.
 */
@Injectable()
export class MailerService {
  private readonly loggerService: LoggerService;
  private readonly transport: Transporter<SMTPTransport.SentMessageInfo>;
  private readonly email: string;
  private readonly domain: string;
  private readonly templates: ITemplates;

  constructor(private readonly configService: ConfigService) {
    const emailConfig = this.configService.get<IEmailConfig>('emailService');
    this.transport = createTransport(emailConfig);
    this.email = `"My App" <${emailConfig.auth.user}>`;
    this.domain = this.configService.get<string>('domain');
    this.loggerService = new Logger(MailerService.name);
    this.templates = {
      confirmation: MailerService.parseTemplate('confirmation.template.hbs'),
      resetPassword: MailerService.parseTemplate('reset-password.template.hbs'),
    };
  }

  /**
   * Parses the template text and returns a compiled Handlebars template delegate.
   *
   * @param templateName - The name of the template file.
   * @returns The compiled Handlebars template delegate.
   */
  private static parseTemplate(
    templateName: string,
  ): Handlebars.TemplateDelegate<ITemplateData> {
    const templateText = readFileSync(
      join(__dirname, 'templates', templateName),
      'utf-8',
    );
    return Handlebars.compile<ITemplateData>(templateText, { strict: true });
  }

  /**
   * Sends an email using the provided parameters.
   *
   * @param to - The recipient's email address.
   * @param subject - The subject of the email.
   * @param html - The HTML content of the email.
   * @param log - Optional log message to be logged after sending the email.
   */
  private sendEmail(
    to: string,
    subject: string,
    html: string,
    log?: string,
  ): void {
    this.transport
      .sendMail({
        from: this.email,
        to,
        subject,
        html,
      })
      .then(() => this.loggerService.log(log ?? 'A new email was sent.'))
      .catch((error) => this.loggerService.error(error));
  }

  /**
   * Sends a confirmation email to the user.
   *
   * @param user - The user object.
   * @param token - The confirmation token.
   */
  sendConfirmationMail(user: User, token: string) {
    const { email, name } = user;
    const subject = 'Confirm your email';
    const html = this.templates.confirmation({
      name,
      link: `${this.domain}/auth/confirm/${token}`,
    });
    this.sendEmail(email, subject, html, 'Confirmation email sent.');
  }

  /**
   * Sends a reset password email to the user.
   *
   * @param user - The user object.
   * @param token - The reset password token.
   */
  sendResetPasswordEmail(user: User, token: string) {
    const { email, name } = user;
    const subject = 'Reset your password';
    const html = this.templates.resetPassword({
      name,
      link: `${this.domain}/auth/reset-password/${token}`,
    });
    this.sendEmail(email, subject, html, 'Reset password email sent.');
  }
}
