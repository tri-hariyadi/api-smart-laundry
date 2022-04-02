import { Request, Response } from 'express';
import responseWrapper, { internalServerError } from '../utils/responseWrapper';
import ILaundryController from '../interfaces/controller.laundry.interface';
import Laundry, { LaundryInput } from '../models/LaundryModel';
import ValidationExeption from '../exceptions/ValidationExeption';

class LaundryController implements ILaundryController {
  create(req: Request, res: Response): void {
    const { user_id, name, domain } = req.body;
    const laundryInput: LaundryInput = { user_id, name, domain };
    const laundry = new Laundry(laundryInput);
    const error = laundry.validateSync();

    if (error) new ValidationExeption().validationError(error, res);
    else laundry.save((err) => {
      if (err) {
        if (JSON.parse(JSON.stringify(err)).code === 11000) return res.status(400).send(responseWrapper(
          null, 'User sudah mempunyai laundry, tidak boleh memiliki lebih dari satu laundry', 400
        ));
        return res.status(500).send(internalServerError);
      }
      res.status(200).send(responseWrapper(
        null, 'Berhasil menyimpan Laundry', 200
      ));
    });
  }

  getAll(req: Request, res: Response): void {
    Laundry.find().sort('-createdAt').exec((err, response) => {
      if (err) res.status(500).send(internalServerError);
      else {
        if (response) res.status(200).send(responseWrapper(
          response, 'Berhasil mendapatkan semua laundry', 200
        ));
        else res.status(404).send(responseWrapper(null, 'Laundry tidak ditemukan', 404));
      }
    });
  }

  delete(req: Request, res: Response): void {
    const { id } = req.params;
    if (!id) res.send(400).send(responseWrapper(null, 'Laundry id harus dikirim.', 400));
    else Laundry.deleteOne({ _id: id }, {}, (err) => {
      if (err) res.status(500).send(internalServerError);
      res.status(200).send(responseWrapper(
        null, 'Berhasil hapus Laundry', 200
      ));
    });
  }

}

export default new LaundryController();
