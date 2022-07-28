import { Request, Response } from 'express';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface INotifController {
  sendMultipleNotif(title: string, subject: string, content: string, userId: string): Promise<void>;
  webNotif(data: {link: string, title: string, message: string, payload?: any}, fcmToken: string): Promise<void>;
  mobileNotif(title: string, body: string, fcmToken: string, data?: any,): Promise<void>;
  sendEventNotif(channel: string, title?: string, body?: string, data?: any): Promise<void>;
  events(req: Request, response: Response): Promise<void>;
}

export default INotifController;
