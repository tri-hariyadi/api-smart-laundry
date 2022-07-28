/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { Request, Response } from 'express';
import * as redis from 'redis';
import NotifController from './NotifController';
import responseWrapper from '../utils/responseWrapper';

const redisOptions = {
  socket: {
    port: 6379,
    host: '127.0.0.1'
  }
};

const subscriber = redis.createClient(redisOptions);
const publisher = redis.createClient(redisOptions);

class LocationController {
  async index(req: Request, res: Response): Promise<Response> {
    try {
      // const response = await NotifController.mobileNotif(
      //   'Order',
      //   'Order telah dikonfirmasi oleh pihak laundry'
      //   'l'
      // );
      const response = await NotifController.webNotif({
        link: '/order',
        title: 'Orderan Masuk',
        message: 'Ada orderan masuk nih, buruan terima biar konsumen ngak kecewa.',
        payload: JSON.stringify({id_customer: '12', id_order: '19'})
      },
      // eslint-disable-next-line max-len
      'fp2RegygmKnvLJdN7i6Suv:APA91bEJ6zkWxaV_3yeBULdJvwBjk3nqn0DtstB7y5OQku1uOkLqBAwuOZs-L0YAUfKrR8_3jXSUIu9cnBFVBAVrPlX2o4yLzlsPVWt8usCbAbo4-t8rIYU_x_OCDIDnguPRJ9CuYS9G'
      );
      return res.status(200).send(responseWrapper(response, 'Successfully send notif', 200));
    } catch (e) {
      console.error('sendFCMMessage error', e);
      return res.status(200).send(responseWrapper(null, 'Gagal', 500));
    }
  }

  async events(request: Request, response: Response) {
    // console.log('connected', request.params.id);
    // const {id} = request.params;
    // const headers = {
    //   'Content-Type': 'text/event-stream',
    //   'Connection': 'keep-alive',
    //   'Cache-Control': 'no-cache'
    // };
    // response.writeHead(200, headers);

    // await subscriber.connect();

    // await subscriber.subscribe(id, async (message) => {
    //   // console.log(`Subscribed to ${message} channels.`);
    //   response.write(`data: ${message}\n\n`);
    //   response.end();
    //   await subscriber.disconnect();
    // });

    // request.on('close', async () => {
    //   // await subscriber.disconnect();
    //   console.log(`${id} Connection closed`);
    // });
  }

  async sendEvent(request: Request, response: Response) {
    // const data = request.body;
    // try {
    //   await publisher.connect();
    //   await publisher.publish(request.params.id, JSON.stringify({
    //     title: 'Konfirmasi Order',
    //     body: 'Order telah ditolak oleh pihak laundrys'
    //   }));
    //   await publisher.disconnect();
    //   response.status(200).send('ok');
    // } catch (error) {
    //   console.log('Errer',JSON.stringify(error));
    //   throw error;
    // }
  }

}

export default new LocationController();
