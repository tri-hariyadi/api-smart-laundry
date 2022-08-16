import { Request, Response } from 'express';
import mongoose from 'mongoose';
import responseWrapper, { internalServerError } from '../utils/responseWrapper';
import IStockController from '../interfaces/controller.stock.interface';
import StockModel, { StockInput } from '../models/StockModel';
import StockInOut, { StockInOutInput } from '../models/StockInOut';
import ValidationExeption from '../exceptions/ValidationExeption';
import errorMessage from '../utils/errorMessage';

class StockController implements IStockController {
  create(req: Request, res: Response): void {
    const { laundry, code, itemName, quantityType, desc } = req.body;
    const stockInput: StockInput = { laundry, code, itemName, quantityType, desc };
    const stock = new StockModel(stockInput);
    const error = stock.validateSync();

    if (error) new ValidationExeption().validationError(error, res);
    else stock.save((err) => {
      if (err) res.status(500).send(internalServerError);
      else res.status(200).send(responseWrapper(null, 'Berhasil menyimpan stock', 200));
    });
  }
  createInOut(req: Request, res: Response): void {
    const { input, out, cost, stock_id } = req.body;
    const stockInput: StockInOutInput = { input, out, cost, stock_id };
    const stock = new StockInOut(stockInput);
    const error = stock.validateSync();

    if (error) new ValidationExeption().validationError(error, res);
    else stock.save((err) => {
      if (err) res.status(500).send(internalServerError);
      else res.status(200).send(responseWrapper(null, 'Berhasil menyimpan item', 200));
    });
  }
  getAllStock(req: Request, res: Response): void {
    StockModel.find().exec((err, results) => {
      if (err) res.status(500).send(internalServerError);
      else if (!results.length) res.status(400).send(responseWrapper(results, 'Belum ada data stok', 400));
      else res.status(200).send(responseWrapper(results, 'Berhasil mendapatkan semua stok', 200));
    });
  }
  getStock(req: Request, res: Response): void {
    const { id_laundry } = req.params;
    const { month, year } = req.body;
    StockModel.aggregate([
      {
        $match: {
          'laundry': new mongoose.Types.ObjectId(id_laundry),
        }
      },
      {
        '$lookup': {
          'from': 'stockinout',
          let: { stockId: '$_id' },
          pipeline: [
            {
              $project: {
                input: '$input',
                out:'$out',
                stock_id: '$stock_id',
                dayOfMonth: { $dayOfMonth: '$createdAt' },
                month: { $month: '$createdAt' },
                year: { $year: '$createdAt' },
              },
            },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$stock_id', '$$stockId'] }
                  ],
                },
                'month' : month ? month : new Date().getUTCMonth() + 1,
                'year': year ? year : new Date().getUTCFullYear(),
              },
            },
            {
              $group: {
                _id: '$stock_id',
                totalInput: { $sum: '$input' },
                totalOut: { $sum: '$out' },
              }
            },
            {
              $addFields: {
                'lastStock': {
                  $subtract: ['$totalInput', '$totalOut']
                }
              }
            }
          ],
          'as': 'stock_in_out',
        }
      },
      {
        $unset: ['__v', 'laundry']
      },
    ]).exec((err, result) => {
      if (err) res.status(500).send(internalServerError);
      else if (!result.length) res.status(400).send(responseWrapper(result, 'Belum ada data stok', 400));
      else res.status(200).send(responseWrapper(result, 'Berhasil mendapatkan stok', 200));
    });
  }
  getInOut(req: Request, res: Response): void {
    const { id_laundry } = req.params;
    const { month, year, code } = req.body;
    const filter = code ? {
      laundry: new mongoose.Types.ObjectId(id_laundry),
      code
    } : {laundry: new mongoose.Types.ObjectId(id_laundry)};
    StockModel.aggregate([
      {
        $match: filter
      },
      {
        '$lookup': {
          'from': 'stockinout',
          let: { stockId: '$_id', code: '$code', itemName: '$itemName' },
          pipeline: [
            {
              $project: {
                code: '$$code',
                itemName: '$$itemName',
                input: '$input',
                out:'$out',
                cost:'$cost',
                createdAt:'$createdAt',
                stock_id: '$stock_id',
                month: { $month: '$createdAt' },
                year: { $year: '$createdAt' },
              },
            },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$stock_id', '$$stockId'] }
                  ],
                },
                'month' : month ? month : new Date().getUTCMonth() + 1,
                'year': year ? year : new Date().getUTCFullYear(),
              },
            },
            { $unset: ['month', 'year'] }
          ],
          'as': 'stock_in_out',
        }
      },
      {
        $project: { stock_in_out: '$stock_in_out' }
      },
      { $unset: ['_id',] }
    ]).exec((err, result) => {
      if (err) res.status(500).send(internalServerError);
      else if (!result.length) res.status(400).send(responseWrapper(result, 'Belum ada data in out stok', 400));
      else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const update_result: Array<any> = [];
        result.forEach((item) => {
          if (item.stock_in_out.length) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            item.stock_in_out.forEach((v: any) => update_result.push(v));
          }
        });
        res.status(200).send(responseWrapper(update_result, 'Berhasil mendapatkan in out stok', 200));
      }
    });
  }
  update(req: Request, res: Response): void {
    const { laundry, code, itemName, quantityType, desc } = req.body;
    const {id} = req.params;
    StockModel.updateOne(
      {_id: id},
      { laundry, code, itemName, quantityType, desc }, {},
      (err, result) => {
        if (err) res.status(500).send(internalServerError);
        else if (!result) res.status(404).send(responseWrapper(null, `Stock dengan id ${id} tidak ditemukan`, 404));
        else res.status(200).send(responseWrapper(null, 'Stock berhasil diupdate', 200));
      }
    );
  }
  updateInOut(req: Request, res: Response): void {
    const { input, out, cost, stock_id } = req.body;
    const {id} = req.params;
    StockInOut.updateOne(
      {_id: id},
      { input, out, cost, stock_id }, {},
      (err, result) => {
        if (err) res.status(500).send(internalServerError);
        else if (!result) res.status(404).send(responseWrapper(
          null, `Data in out stock dengan id ${id} tidak ditemukan`, 404));
        else res.status(200).send(responseWrapper(null, 'Data in out stock berhasil diupdate', 200));
      }
    );
  }
  async deleteStock(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) res.send(400).send(responseWrapper(null, 'Stock id harus dikirim.', 400));
    try {
      const result = await StockModel.findByIdAndDelete(id);
      const stocktIds = result?._id;

      await StockInOut.deleteMany({
        _id: {
          $in: stocktIds,
        },
      });
      res.status(200).send(responseWrapper(null, 'Stock berhasil dihapus', 200));
    } catch (error) {
      const message = errorMessage.getErrorMessage(error);
      if (message) res.status(400).send(responseWrapper(400, message, 400));
      else res.status(500).send(internalServerError);
    }
  }
  deleteInOut(req: Request, res: Response): void {
    const { id } = req.params;
    if (!id) res.send(400).send(responseWrapper(null, 'In out stock id harus dikirim.', 400));
    StockInOut.findByIdAndDelete(id).exec((err, result) => {
      if (err) res.status(500).send(internalServerError);
      else if (!result) res.status(400).send(responseWrapper(result, 'In out stok gagal dihapus', 400));
      else res.status(200).send(responseWrapper(result, 'Berhasil menghapus data in out stok', 200));
    });
  }

}

export default new StockController();
