export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailProvider {
  sendEmail(options: SendEmailOptions): Promise<void>;
  verifyConnection?(): Promise<boolean>;
}