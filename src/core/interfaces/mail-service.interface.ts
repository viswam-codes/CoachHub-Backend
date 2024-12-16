export const MAIL_SERVICE = Symbol('MAIL_SERVICE');


export interface IMailService {
    sendMail(to: string, subject: string, text: string, html?: string): Promise<void>;
  }
  