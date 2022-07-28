/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable no-useless-catch */
import { Request, Response } from 'express';
import admin from 'firebase-admin';
import serviceAccount from '../firebase.json';
import User from '../models/UserModel';
import INotifController from '../interfaces/controller.notif.interface';
import client from '../utils/initRedis';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

class NotifController implements INotifController {
  async sendMultipleNotif(title: string, subject: string, userId: string, content?: string): Promise<void> {
    try {
      const user = await User.find({ fcmToken: { $exists: true }, _id: userId }, 'fcmToken');
      const tokens = user.map(user => user.fcmToken);
      const current = new Date();
      const dataConsole = {
        title,
        subject,
        content: content as string,
        createdAt: new Date(Date.UTC(current.getFullYear(),
          current.getMonth(), current.getDate(), current.getHours(),
          current.getMinutes(), current.getSeconds(), current.getMilliseconds())).toJSON().slice(0, 10)
      };

      console.log(dataConsole);
      await admin.messaging().sendMulticast({
        data: dataConsole,
        tokens: tokens as Array<string>,
      })
        .then((response) => { console.log(response); })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      throw error;
    }
  }

  async webNotif(
      data: {link: string, title: string, message: string, payload?: string},
      fcmToken: string): Promise<void> {
    try {
      await admin.messaging().send({
        data,
        token: fcmToken,
      });
    } catch (e) {
      throw e;
    }
  }

  async mobileNotif(title: string, body: string, fcmToken: string, data?: any): Promise<void> {
    try {
      const message = {
        notification: {
          title,
          body
        },
        android: {
          notification: {
            imageUrl: 'http://localhost:3006/favicon.ico'
          }
        },
        apns: {
          payload: {
            aps: {
              'mutable-content': 1
            }
          },
          fcmOptions: {
            imageUrl: 'http://localhost:3006/favicon.ico'
          }
        },
        data,
        token: fcmToken
      };
      await admin.messaging().send(message);
    } catch (error) {
      throw error;
    }
  }

  async events(req: Request, resp: Response) {
    console.log('connected', req.params.id);
    const {id} = req.params;
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    };
    resp.writeHead(200, headers);

    const subscriber = client.duplicate();
    await subscriber.connect();

    subscriber.subscribe(id, async (message) => {
      if (subscriber.isOpen) await subscriber.disconnect();
      resp.write(`data: ${message}\n\n`);
      resp.end();
    });

    req.on('close', async () => {
      if (subscriber.isOpen) await subscriber.disconnect();
      console.log(`${id} Connection closed`);
    });
  }

  async sendEventNotif(channel: string, title?: string, body?: string, data?: any) {
    try {
      const publisher = client.duplicate();
      await publisher.connect();
      await publisher.publish(channel, JSON.stringify({title, body, data}));
      if (publisher.isOpen) await publisher.disconnect();
    } catch (error) {
      throw error;
    }
  }

}

export default new NotifController();
