import { log } from '@temporalio/activity';

export type SendEmailResult = {
  success: true;
  messageId: string;
  timestamp: number;
};

export type EmailObject = {
  to: string;
  subject: string;
  body: string;
};

export async function sendEmail(mail: EmailObject): Promise<SendEmailResult> {
  log.info(`[MOCK EMAIL] To=${mail.to} Subject="${mail.subject}"`);

  return {
    success: true,
    messageId: crypto.randomUUID(),
    timestamp: Date.now(),
  };
}
