import { Request, Response } from 'express';
import responseWrapp, { internalServerError } from '../utils/responseWrapper';
import IOrderController from '../interfaces/controller.order.interface';
import Order, { OrderInput } from '../models/OrderModel';
import User from '../models/UserModel';
import ValidationException from '../exceptions/ValidationExeption';
import ErrorMessage from '../utils/errorMessage';

class OrderController implements IOrderController {
  create(req: Request, res: Response): void {
    const { service, sub_service, address, pickUpTime, totalPrice,
      total, note, payment, id_merchant, id_customer } = req.body;
    const orderInput: OrderInput = { service, sub_service, address, pickUpTime, totalPrice,
      total, note, payment, id_merchant, id_customer };
    const order = new Order(orderInput);
    const error = order.validateSync();

    if (error) new ValidationException().validationError(error, res);
    else order.save((err) => {
      if (err) return res.status(500).send(internalServerError);
      res.status(200).send(responseWrapp( null, 'Order berhasil ditambahkan', 200));
    });
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    let user: { _id: string, code: number } | null;
    let query: { id_merchant?: string, id_customer?: string } = {};
    try {
      user = await User.findOne({ _id: id }, '-__v _id')
        .populate('role', '-_id code');
      if (!user) throw new Error('Data order tidak ditemukan');
      else {
        if (user.code === 1) query = { id_merchant: id };
        else if (user.code === 2) query = { id_customer: id };

        Order.find(query, '-__v').populate('service', '-__v, -_id')
          .exec((err, result) => {
            if (err) throw new Error(undefined);
            res.status(200).send(responseWrapp(result, 'Berhasil mendapatkan semua order', 200));
          });
      }
    } catch (error) {
      const message = ErrorMessage.getErrorMessage(error);
      if (message) res.status(400).send(responseWrapp(400, message, 400));
      else res.status(500).send(internalServerError);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id, id_order } = req.params;
    let user: { _id: string, code: number } | null;
    const query: { _id: string, id_merchant?: string, id_customer?: string } = { _id: id_order };
    try {
      user = await User.findOne({ _id: id }, '-__v _id')
        .populate('role', '-_id code');
      if (!user) throw new Error('Data order tidak ditemukan');
      else {
        if (user.code === 1) query.id_merchant = id;
        else if (user.code === 2) query.id_customer = id;

        Order.findOne(query, '-__v').populate('service', '-__v -_id')
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

}

export default new OrderController();
