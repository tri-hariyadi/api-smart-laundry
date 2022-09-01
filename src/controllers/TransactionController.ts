import { Request, Response } from 'express';
import mongoose from 'mongoose';
import responseWrapper, { internalServerError } from '../utils/responseWrapper';
import Order from '../models/OrderModel';
import Stock from '../models/StockModel';

class TransactionController {
  todayTransaction = (req: Request, res: Response): void => {
    const { id_merchant } = req.params;
    Order.aggregate([
      {
        $project: {
          id_merchant: '$id_merchant',
          createdAt: '$createdAt',
          dayOfMonth: { $dayOfMonth: '$createdAt' },
          year: { $year: '$createdAt' },
          totalPrice:'$totalPrice'
        },
      },
      {
        $match: {
          'id_merchant': new mongoose.Types.ObjectId(id_merchant),
          'dayOfMonth': new Date().getDate(),
          'year': new Date().getUTCFullYear(),
        }
      },
      {
        $group: {
          _id: '$id_merchant',
          TotalTransaction: {$sum: '$totalPrice'}
        }
      }
    ]).exec((err, result) => {
      if (err) res.status(500).send(internalServerError);
      else res.status(200).send(responseWrapper(result, 'Berhasil mendapatkan transaksi', 200));
    });
  };

  monthlyTransaction = (req: Request, res: Response): void => {
    const { id_merchant } = req.params;
    Order.aggregate([
      {
        $project: {
          id_merchant: '$id_merchant',
          createdAt: '$createdAt',
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
          totalPrice:'$totalPrice'
        },
      },
      {
        $match : {
          'id_merchant': new mongoose.Types.ObjectId(id_merchant),
          'month' : new Date().getUTCMonth() + 1,
          'year': new Date().getUTCFullYear(),
        },
      },
      {
        $group: {
          _id: '$id_merchant',
          TotalTransaction: {$sum: '$totalPrice'},
        },
      }
    ]).exec((err, result) => {
      if (err) res.status(500).send(internalServerError);
      else res.status(200).send(responseWrapper(result, 'Berhasil mendapatkan transaksi', 200));
    });
  };

  yearTransaction = (req: Request, res: Response): void => {
    const { id_merchant } = req.params;
    Order.aggregate([
      {
        $project: {
          id_merchant: '$id_merchant',
          createdAt: '$createdAt',
          year: { $year: '$createdAt' },
          totalPrice:'$totalPrice'
        },
      },
      {
        $match : {
          'id_merchant': new mongoose.Types.ObjectId(id_merchant),
          'year': new Date().getUTCFullYear(),
        },
      },
      {
        $group: {
          _id: '$id_merchant',
          TotalTransaction: {$sum: '$totalPrice'},
        },
      }
    ]).exec((err, result) => {
      if (err) res.status(500).send(internalServerError);
      else res.status(200).send(responseWrapper(result, 'Berhasil mendapatkan transaksi', 200));
    });
  };

  laundryInProcess = (req: Request, res: Response): void => {
    const { id_merchant } = req.params;
    Order.aggregate([
      {
        $project: {
          id_merchant: '$id_merchant',
          status: '$status'
        },
      },
      {
        $match : {
          'id_merchant': new mongoose.Types.ObjectId(id_merchant),
          'status': '0',
        },
      },
      {
        $group: {
          _id: '$id_merchant',
          count: { $sum: 1 },
        },
      }
    ]).exec((err, result) => {
      if (err) res.status(500).send(internalServerError);
      else res.status(200).send(responseWrapper(result, 'Berhasil mendapatkan transaksi', 200));
    });
  };

  chartMonthlyTransaction = (req: Request, res: Response): void => {
    const { id_merchant } = req.params;
    const { month, year } = req.body;
    Order.aggregate([
      {
        $project: {
          id_merchant: '$id_merchant',
          totalPrice:'$totalPrice',
          dayOfMonth: { $dayOfMonth: '$createdAt' },
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
      },
      {
        $match : {
          'id_merchant': new mongoose.Types.ObjectId(id_merchant),
          'month' : month ? month : new Date().getUTCMonth() + 1,
          'year': year ? year : new Date().getUTCFullYear(),
        },
      },
      {
        $group: {
          _id: '$dayOfMonth',
          totalIncome: { $sum: '$totalPrice' },
        },
      },
      {
        $sort: {_id: -1}
      }
    ]).exec((err, result) => {
      if (err) res.status(500).send(internalServerError);
      else if (!result.length) res.status(200).send(responseWrapper(result, 'Belum ada transaksi di bulan ini', 200));
      else res.status(200).send(responseWrapper(result, 'Berhasil mendapatkan transaksi', 200));
    });
  };

  chartMonthlyExpenses = (req: Request, res: Response): void => {
    const { laundry } = req.params;
    const { month, year } = req.body;
    Stock.aggregate([
      {
        $match: {
          laundry: new mongoose.Types.ObjectId(laundry),
        },
      },
      {
        '$lookup': {
          from: 'stockinout',
          let: { stockId: '$_id', code: '$code', itemName: '$itemName' },
          pipeline: [
            {
              $project: {
                code: '$$code',
                cost:'$cost',
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
                month : month ? month : new Date().getUTCMonth() + 1,
                year: year ? year : new Date().getUTCFullYear(),
              },
            },
            {
              $group: {
                _id: '$code',
                totalExpenses: { $sum: '$cost' },
              },
            },
          ],
          'as': 'stock_in_out',
        }
      },
      { $unset: ['_id'] },
      {
        $project:  { stock_in_out:  '$stock_in_out', itemName: '$itemName' }
      }
    ]).exec((err, result) => {
      if (err) res.status(500).send(internalServerError);
      else if (!result.length) res.status(200).send(responseWrapper(result, 'Belum ada pengeluaran di bulan ini', 200));
      else res.status(200).send(responseWrapper(result, 'Berhasil mendapatkan transaksi', 200));
    });
  };

  incomeExpenseChart = (req: Request, res: Response): void => {
    const { id_merchant, laundry } = req.params;
    const { year } = req.body;
    const monthsArray = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
      'Agustus', 'September', 'Oktober', 'November', 'Desember' ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Partial<{ income: any; expenses: any }> = {};
    Order.aggregate([
      {
        $project: {
          id_merchant: '$id_merchant',
          totalPrice:'$totalPrice',
          dayOfMonth: { $dayOfMonth: '$createdAt' },
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
      },
      {
        $match : {
          'id_merchant': new mongoose.Types.ObjectId(id_merchant),
          'year': year ? year : new Date().getUTCFullYear(),
        },
      },
      {
        $group: {
          _id: {'month': '$month'},
          total: {$sum: '$totalPrice'}
        }
      },
      { $sort : { _id : 1 } },
      {
        $project: {
          month: {$arrayElemAt: [monthsArray, {$subtract: ['$_id.month', 1]}]},
          total: '$total'
        }
      },
      {$unset: '_id'}
    ]).exec((err, resultIncome) => {
      if (err) res.status(500).send(internalServerError);
      else {
        data.income = resultIncome;
        Stock.aggregate([
          {
            $match: {
              laundry: new mongoose.Types.ObjectId(laundry),
            },
          },
          {
            $group: {
              _id: '$laundry',
            },
          },
          {
            '$lookup': {
              from: 'stockinout',
              let: { code: '$code' },
              pipeline: [
                {
                  $project: {
                    code: '$$code',
                    cost:'$cost',
                    month: { $month: '$createdAt' },
                    year: { $year: '$createdAt' },
                  },
                },
                {
                  $match: {
                    year: year ? year : new Date().getUTCFullYear(),
                  },
                },
                {
                  $group: {
                    _id: {month: '$month'},
                    totalExpenses: { $sum: '$cost' },
                  },
                },
                {
                  $project:  {
                    month: {$arrayElemAt: [monthsArray, {$subtract: ['$_id.month', 1]}]},
                    total:'$totalExpenses'
                  }
                },
                { $unset: ['_id'] },
              ],
              'as': 'stock_in_out',
            }
          },
          { $unset: ['_id'] },
          {
            $project:  { stock_in_out:'$stock_in_out' }
          },
        ]).exec((err, resultExpense) => {
          if (err) res.status(500).send(internalServerError);
          else if (!resultIncome.length || !resultExpense.length) {
            res.status(200).send(responseWrapper(null, 'Belum ada transaksi di tahun ini', 200));
          } else {
            data.expenses = resultExpense;
            res.status(200).send(responseWrapper(data, 'Berhasil mendapatkan transaksi', 200));
          }
        });
      }
    });
  };

}

export default new TransactionController();
