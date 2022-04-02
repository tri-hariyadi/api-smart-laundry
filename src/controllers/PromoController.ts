import { Request, Response } from 'express';
import responseWrapper, { internalServerError } from '../utils/responseWrapper';
import IPromoController from '../interfaces/controller.promo.interface';
import Promo, { PromoInput } from '../models/PromoModel';
import ValidationException from '../exceptions/ValidationExeption';

class PromoController implements IPromoController {
  create(req: Request, res: Response): void {
    const { name, desc, start, end, diskon, minOrder, laundry_id } = req.body;
    const promoInput: PromoInput = { name, desc, start, end, diskon, minOrder, laundry_id };
    const promo = new Promo(promoInput);
    const error = promo.validateSync();

    if (error) new ValidationException().validationError(error, res);
    else promo.save((err) => {
      if (err) return res.status(500).send(internalServerError);
      res.status(200).send(responseWrapper(
        null, 'Berhasil menyimpan Promo', 200
      ));
    });
  }

  getAll(req: Request, res: Response): void {
    const { laundry_id } = req.params;
    Promo.find({ laundry_id }).sort('-createdAt').exec((err, response) => {
      if (err) {
        res.status(500).send(internalServerError);
      } else {
        if (response.length) res.status(200).send(responseWrapper(
          response, 'Berhasil mendapatkan semua promo', 200
        ));
        else res.status(404).send(responseWrapper(null, 'Promo tidak ditemukan', 404));
      }
    });
  }

  getByServiceId(req: Request, res: Response): void {
    const { id } = req.params;
    Promo.findOne({ _id: id }, {}, {}, (err, result) => {
      if (err) {
        return res.status(500).send(internalServerError);
      } else if (!result) {
        return res.status(404).send(responseWrapper(null, 'Data promo tidak ditemukan', 404));
      }
      return res.status(200).send(responseWrapper(result, 'Berhasil mendapatkan data promo  ', 200));
    });
  }

  update(req: Request, res: Response): void {
    const { id } = req.params;
    const { name, desc, start, end, diskon, minOrder, laundry_id } = req.body;
    const promoInput: PromoInput = { name, desc, start, end, diskon, minOrder, laundry_id };
    const promo = new Promo(promoInput);
    const error = promo.validateSync();
    const errMessage = new ValidationException().validate(error, '-laundry_id^required');

    if (errMessage) res.status(400).send(responseWrapper(null, errMessage, 400));
    else Promo.updateOne({ _id: id }, promoInput).exec((err) => {
      if (err) return res.status(500).send(internalServerError);
      return res.status(200).send(responseWrapper( null, 'Update promo berhasil', 200));
    });
  }

  delete(req: Request, res: Response): void {
    const { id } = req.params;
    Promo.findOneAndDelete({ _id: id }, {}, (err, result) => {
      if (err) {
        return res.status(500).send(internalServerError);
      } else {
        if (!result) return res.status(400).send(responseWrapper(null,
          `Promo dengan id ${id}, tidak ditemukan atau mungkin telah dihapus`, 400));
        return res.status(200).send(responseWrapper(null, 'Berhasil menghapus promo', 200));
      }
    });
  }

}

export default new PromoController();
