import mongoose, { Schema, Model, Document } from 'mongoose';

type StockDocument = Document & {
  laundry: string;
  itemName: string;
  date: Date;
  input: number;
  out: number;
  returnItem: number;
  quantity: number;
  quantityType: string;
  cost: number;
  desc: string;
}

type StockInput = {
  laundry: StockDocument['laundry'];
  itemName: StockDocument['itemName'];
  date: StockDocument['date'];
  input: StockDocument['input'];
  out: StockDocument['out'];
  returnItem: StockDocument['returnItem'];
  quantity: StockDocument['quantity'];
  quantityType: StockDocument['quantityType']
  cost: StockDocument['cost'];
  desc: StockDocument['desc'];
}

const stockSchema = new Schema(
  {
    itemName: {
      type: Schema.Types.String,
      required: [true, 'Nama item harus diisi'],
    },
    date: {
      type: Schema.Types.Date,
      required: [true, 'Tanggal harus diinput.'],
    },
    input: {
      type: Schema.Types.Number,
      default: 0,
    },
    out: {
      type: Schema.Types.Number,
      default: 0,
    },
    returnItem: {
      type: Schema.Types.Number,
      default: 0,
    },
    quantity: {
      type: Schema.Types.Number,
      required: [true, 'Kuantitas harus diinput.'],
    },
    quantityType: {
      type: Schema.Types.String,
      required: [true, 'Tipe kuantitas harus diinput.'],
    },
    cost: {
      type: Schema.Types.Number,
      required: [true, 'Biaya harus diisi'],
    },
    desc: { type: Schema.Types.String },
    laundry: {
      type: Schema.Types.ObjectId,
      ref: 'Laundry',
      required: [true, 'Laundry id harus diisi'],
      index: true,
    },
  },
  {
    collection: 'stock',
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

const Stock: Model<StockDocument> = mongoose.model<StockDocument>('Stock', stockSchema);

export { StockInput, StockDocument };

export default Stock;
