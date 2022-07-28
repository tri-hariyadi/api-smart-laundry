import { Request, Response } from 'express';
import responseWrapper, { internalServerError } from '../utils/responseWrapper';
import IStockController from '../interfaces/controller.stock.interface';
import StockModel, { StockInput } from '../models/StockModel';
import ValidationExeption from '../exceptions/ValidationExeption';

class StockController implements IStockController {
  create(req: Request, res: Response): void {
    const { laundry, itemName, date, input, out, returnItem, quantity, quantityType, cost, desc } = req.body;
    const stockInput: StockInput = {
      laundry, itemName, date, input, out, returnItem, quantity, quantityType, cost, desc };
    const stock = new StockModel(stockInput);
    const error = stock.validateSync();

    if (error) new ValidationExeption().validationError(error, res);
    else stock.save((err) => {
      if (err) res.status(500).send(internalServerError);
      else res.status(200).send(responseWrapper(null, 'Berhasil menyimpan stock', 200));
    });
  }
  getAll(req: Request, res: Response): void {
    const {startDate, endDate, id_laundry} = req.body;
    let query: Partial<{laundry: string; date: {$gte: Date, $lte: Date}}> = {laundry: id_laundry};
    if (startDate && endDate) query = {
      ...query,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    StockModel.find(query).sort('-date').exec((err, response) => {
      if (err) res.status(500).send(internalServerError);
      else {
        if (response) res.status(200).send(responseWrapper(response, 'Berhasil mendapatkan semua stock', 200));
        else res.status(404).send(responseWrapper(null, 'Stock tidak ditemukan', 404));
      }
    });
  }
  update(req: Request, res: Response): void {
    const { itemName, date, input, out, returnItem, quantity, quantityType, cost, desc } = req.body;
    const {id} = req.params;
    StockModel.updateOne(
      {_id: id},
      { itemName, date, input, out, returnItem, quantity, quantityType, cost, desc }, {},
      (err, result) => {
        if (err) res.status(500).send(internalServerError);
        else if (!result) res.status(404).send(responseWrapper(null, `Stock dengan id ${id} tidak ditemukan`, 404));
        else res.status(200).send(responseWrapper(null, 'Stock berhasil diupdate', 200));
      }
    );
  }
  delete(req: Request, res: Response): void {
    const { id } = req.params;
    if (!id) res.send(400).send(responseWrapper(null, 'Stock id harus dikirim.', 400));
    else StockModel.deleteOne({ _id: id }, {}, (err) => {
      if (err) res.status(500).send(internalServerError);
      res.status(200).send(responseWrapper(null, 'Berhasil hapus Stock Item', 200));
    });
  }

}

export default new StockController();
