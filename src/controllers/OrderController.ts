import { Request, Response } from 'express';
import NotifController from './NotifController';
import Distance from '../utils/distance';
import responseWrapp, { internalServerError } from '../utils/responseWrapper';
import IOrderController from '../interfaces/controller.order.interface';
import Order, { OrderInput } from '../models/OrderModel';
import User from '../models/UserModel';
import Role from '../models/RoleModel';
import Services from '../models/ServicesModel';
import ValidationException from '../exceptions/ValidationExeption';
import ErrorMessage from '../utils/errorMessage';

interface IPromo {
  _id: string;
  promo: {
    start: string;
    end: string;
    diskon: {
      typeDiskon: string,
      valueDiskon: number
    }
    minOrder: {
      typeMinOrder: string,
      valueMinOrder: number
    }
  }
}
class OrderController implements IOrderController {
  private timer: ReturnType<typeof setTimeout> = setTimeout(() => '', 1000);

  create = async (req: Request, res: Response): Promise<void> => {
    const { action } = req.params;
    const { service, sub_service, address, totalPrice,
      total, note, payment, id_merchant, id_customer } = req.body;
    const orderInput: OrderInput = { service, sub_service, address, totalPrice: totalPrice || 0,
      total, note, payment, id_merchant, id_customer };

    if (action === 'create') {
      const order = new Order(orderInput);
      const error = order.validateSync();
      const errMessage = new ValidationException().validate(error, '-totalPrice^required');

      if (errMessage) res.status(400).send(responseWrapp(null, errMessage, 400));
      else {
        const laundry = await User.findOne({ _id: id_merchant });
        if (laundry) {
          order.save(async (err, result) => {
            if (err) return res.status(500).send(internalServerError);
            clearTimeout(this.timer);
            await NotifController.sendEventNotif(
              id_customer,
              'Konfirmasi Order',
              'Order telah dikonfirmasi oleh pihak laundry',
              {status: 'accept', id_order: result._id}
            );
            res.status(200).send(responseWrapp(null, 'Berhasil mengkonfirmasi order', 200));
          });
        } else res.status(500).send(internalServerError);
      }
    } else {
      try {
        const laundry = await User.findOne({ _id: id_merchant });
        await NotifController.webNotif(
          {
            link: '/',
            title: 'Orderan Masuk',
            message: 'Ada orderan masuk nih, buruan terima biar konsumen ngak kecewa.',
            payload: JSON.stringify({ service, sub_service, address, totalPrice,
              total, note, payment, id_merchant, id_customer })
          },
          laundry?.fcmToken as string
        );
        this.timer = setTimeout(async function () {
          await Promise.resolve(NotifController.sendEventNotif(
            id_customer,
            'Gagal Order',
            'Waktu order telah berakhir, coba order ulang atau ganti ke laundry yang baru',
            'reject'
          ));
        }, 30000);
      } catch (error) {
        const message = ErrorMessage.getErrorMessage(error);
        if (message) res.status(400).send(responseWrapp(400, 'Terjadi kesalahan, tidak bisa melakukan order', 400));
        else res.status(500).send(internalServerError);
      }
    }
  };

  async getAll(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const {startDate, endDate} = req.body;
    let user: { _id: string, role: string } | null;
    const query: { id_merchant?: string; id_customer?: string; createdAt?: unknown } = {};
    try {
      user = await User.findOne({ _id: id }, '-__v -_id');
      const role: { code: number } | null = await Role.findOne({ _id: user?.role });
      if (!user) throw new Error('Data order tidak ditemukan');
      else {
        if (startDate && endDate) {
          query.createdAt = {
            $gte: new Date(startDate).toISOString(),
            $lte: new Date(`${endDate} 23:59:59 UTC`).toISOString()
          };
        }
        if (role?.code === 1) query.id_merchant = id ;
        else if (role?.code === 2) query.id_customer = id;

        Order.find(query, '-__v').populate({
          path: 'service',
          select: 'name desc price quantityType banner',
          populate: {
            path: 'laundry',
            select: '-_id name',
          }
        }).populate('id_customer', '-_id fullName phoneNumber')
          .exec((err, result) => {
            if (err) throw new Error(undefined);
            res.status(200).send(responseWrapp(result, 'Berhasil mendapatkan semua order', 200));
          });
      }
    } catch (error) {
      const message = ErrorMessage.getErrorMessage(error);
      if (message) res.status(400).send(responseWrapp(null, message, 400));
      else res.status(500).send(internalServerError);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id, id_order } = req.params;
    let user: { _id: string, role: string } | null;
    const query: { _id: string, id_merchant?: string, id_customer?: string } = { _id: id_order };
    try {
      user = await User.findOne({ _id: id }, '-__v _id');
      const role: { code: number } | null = await Role.findOne({ _id: user?.role });
      if (!user) throw new Error('Data order tidak ditemukan');
      else {
        if (role?.code === 1) query.id_merchant = id;
        else if (role?.code === 2) query.id_customer = id;

        Order.findOne(query, '-__v')
          .populate({
            path: 'service',
            select: '-_id name desc price quantityType',
            populate: {
              path: 'laundry',
              select: '-_id name',
            }
          })
          .populate('id_merchant', '-__v -_id -password -role -createdAt -updatedAt -fcmToken')
          .populate('id_customer', '-__v -_id -password -role -createdAt -updatedAt')
          .exec((err, result) => {
            if (err) throw new Error(undefined);
            res.status(200).send(responseWrapp(result, 'Berhasil mendapatkan order', 200));
          });
      }
    } catch (error) {
      const message = ErrorMessage.getErrorMessage(error);
      if (message) res.status(400).send(responseWrapp(400, message, 400));
      else res.status(500).send(internalServerError);
    }
  }

  async updateProgress(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, desc, status } = req.body;
    let StatusOrder = '0';
    try {
      const order = await Order.findOne({ _id: id }, '-__v');
      if (!order) throw new Error('Order tidak ditemukan');
      if (!desc) throw new Error('Deskripsi proses harus diisi');
      if (!status) throw new Error('Status proses harus diisi');

      const progress = [...JSON.parse(JSON.stringify(order.progress))];
      const idx = progress.findIndex(el => el.name === name);
      if (idx > -1) {
        progress[idx] = { ...progress[idx], desc, status };
        if (progress[idx].name === 'Delivered') StatusOrder = '1';
      }
      else throw new Error('Progress tidak ditemukan');

      Order.updateOne({ _id: id }, { progress, status: StatusOrder })
        .exec(err => {
          if (err) throw new Error(undefined);
          res.status(200).send(responseWrapp(null, 'Berhasil mengupdate progress', 200));
        });
    } catch (error) {
      const message = ErrorMessage.getErrorMessage(error);
      if (message) res.status(400).send(responseWrapp(400, message, 400));
      else res.status(500).send(internalServerError);
    }
  }

  rejectOrder = async (req: Request, res: Response): Promise<void> => {
    const { idcust } = req.params;
    clearTimeout(this.timer);
    await Promise.resolve(NotifController.sendEventNotif(
      idcust,
      'Konfirmasi Order',
      'Order telah ditolak oleh pihak laundry',
      'reject'
    ));
    res.status(200).send(responseWrapp(
      null, 'Berhasil reject order', 200
    ));
  };

  getStatusOrder(req: Request, res: Response): void {
    const { idUser } = req.params;
    Order.findOne({ id_customer: idUser, status: '0' }, {}, {}, (err, result) => {
      if (err) return res.status(500).send(internalServerError);
      if (result) res.status(200).send(responseWrapp({ anyorder: true }, 'success', 200));
      else res.status(200).send(responseWrapp({ anyorder: false }, 'success', 200));
    });
  }

  async calculatePrice(req: Request, res: Response): Promise<Response> {
    const { totalPay, totalOrder, id_service, laundryPosition, custPosition } = req.body;
    const distance = new Distance(
      laundryPosition.lat, laundryPosition.long, custPosition.lat, custPosition.long).getDistance();
    const costDelivery = Math.round(distance * 4500);
    const costApp = 0;

    if (!totalPay) return res.status(400).send(responseWrapp({costDelivery, costApp}, 'Total pay harus diisi', 400));
    if (!totalOrder)
      return res.status(400).send(responseWrapp({costDelivery, costApp}, 'Total order harus diisi', 400));
    if (!id_service) return res.status(400).send(responseWrapp(null, 'Service harus diisi', 400));

    const totalPrice = totalPay + costDelivery + costApp;

    const service: IPromo | null = await Services.findOne({ _id: id_service }, '_id')
      .populate('promo', '-_id diskon start end minOrder');
    if (service && service.promo) {
      if (service.promo.minOrder.typeMinOrder === 'weight') {
        if (totalOrder < service.promo.minOrder.valueMinOrder)
          return res.status(200).send(responseWrapp(
            {totalPrice, costDelivery, costApp},
            'Promo tidak berlaku, minimal order tidak terpenuhi',
            200
          ));
      }

      if (service.promo.minOrder.typeMinOrder === 'price') {
        if (totalPay < service.promo.minOrder.valueMinOrder)
          return res.status(200).send(responseWrapp(
            {totalPrice, costDelivery, costApp},
            'Promo tidak berlaku, minimal order tidak terpenuhi',
            200
          ));
      }

      if (new Date().getTime() < new Date(service.promo.start).getTime())
        return res.status(200).send(responseWrapp({totalPrice, costDelivery, costApp}, 'Promo belum berlaku', 200));

      if (new Date().getTime() > new Date(service.promo.end).getTime())
        return res.status(200).send(responseWrapp({totalPrice, costDelivery, costApp}, 'Promo sudah berakhir', 200));

      let priceAfterDiskon = 0;
      let priceDiscount = 0;
      if (service.promo.diskon.typeDiskon === 'percent') {
        priceDiscount = (service.promo.diskon.valueDiskon/100) * totalPay;
        priceAfterDiskon = totalPrice - priceDiscount;
      } else if (service.promo.diskon.typeDiskon === 'nominal') {
        priceDiscount = service.promo.diskon.valueDiskon;
        priceAfterDiskon = totalPrice - priceDiscount;
      }

      if (priceAfterDiskon) {
        return res.status(200).send(responseWrapp(
          {totalPrice: priceAfterDiskon, costDelivery, costApp, priceDiscount},
          'Berhasil menghitung harga promo',
          200
        ));
      }
      return res.status(400).send(responseWrapp(priceAfterDiskon, 'Gagal menghitung harga promo', 400));
    } else {
      return res.status(200).send(responseWrapp(
        {totalPrice, costDelivery, costApp},
        'Berhasil menghitung harga',
        200
      ));
    }
  }

  inputWeight(req: Request, res: Response): void {
    const { totalPrice, total } = req.body;
    const {id_order} = req.params;
    Order.updateOne({ _id: id_order }, { totalPrice, total }, {}, (err) => {
      if (err) return res.status(500).send(internalServerError);
      res.status(200).send(responseWrapp(null, 'Berhasil input berat kg cucian', 200));
    });
  }

}

export default new OrderController();
