import mongoose, { Schema, Model, Document } from 'mongoose';

type StockInOutDocument = Document & {
  // date: Date;
  input: number;
  out: number;
  cost: number;
  stock_id: string;
}

type StockInOutInput = {
  // date: StockInOutDocument['date'];
  input: StockInOutDocument['input'];
  out: StockInOutDocument['out'];
  cost: StockInOutDocument['cost'];
  stock_id: StockInOutDocument['stock_id'];
}

const stockInOutSchema = new Schema(
  {
    // date: {
    //   type: Schema.Types.Date,
    //   required: [true, 'Tanggal harus diisi'],
    // },
    input: {
      type: Schema.Types.Number,
      default: 0,
    },
    out: {
      type: Schema.Types.Number,
      default: 0,
    },
    cost: {
      type: Schema.Types.Number,
      default: 0,
    },
    stock_id: {
      type: Schema.Types.ObjectId,
      ref: 'Stock',
      required: [true, 'Stock id harus diisi'],
      index: true,
    },
  },
  {
    collection: 'stockinout',
    timestamps: {
      currentTime: () => {
        const current = new Date();
        const timeStamp = new Date(Date.UTC(current.getFullYear(),
          current.getMonth(), current.getDate(), current.getHours(),
          current.getMinutes(), current.getSeconds(), current.getMilliseconds()));
        return timeStamp;
      },
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
  }
);

const StockInOut: Model<StockInOutDocument> = mongoose.model<StockInOutDocument>('StockInOut', stockInOutSchema);

export { StockInOutInput, StockInOutDocument };

export default StockInOut;
