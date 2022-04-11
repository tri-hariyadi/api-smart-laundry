import mongoose, { Document, Schema, Model } from 'mongoose';

type OrderDocument = Document & {
  _id: string;
  service: string,
  sub_service?: {
    name?: string;
    price?: number;
    total?: number;
    note?: string;
    tag?: string;
  }[];
  address: {
    city: string;
    street: string;
    lat: number;
    long: number
  },
  pickUpTime: Date;
  totalPrice: number;
  total: number;
  note?: string;
  payment: string;
  progress?: {
    name: string,
    desc: string,
    status?: string
  }[];
  id_merchant: string;
  id_customer: string;
}

type OrderInput = {
  service: OrderDocument['service'];
  sub_service: OrderDocument['sub_service'];
  address: OrderDocument['address'];
  pickUpTime: OrderDocument['pickUpTime'];
  totalPrice: OrderDocument['totalPrice'];
  total: OrderDocument['total'];
  note: OrderDocument['note'];
  payment: OrderDocument['payment'];
  id_merchant: OrderDocument['id_merchant'];
  id_customer: OrderDocument['id_customer'];
}

const addressSchema = new Schema({
  city: {
    type: Schema.Types.String,
    required: [true, 'Kota harus diisi']
  },
  street: {
    type: Schema.Types.String,
    required: [true, 'Jalan harus diisi']
  },
  lat: {
    type: Schema.Types.Number,
    required: [true, 'Latitude harus diisi']
  },
  long: {
    type: Schema.Types.Number,
    required: [true, 'Longitude harus diisi']
  }
}, { _id: false });

const subServiceSchema = new Schema({
  name: Schema.Types.String,
  price: Schema.Types.Number,
  total: Schema.Types.Number,
  note: Schema.Types.String,
  tag: Schema.Types.String
}, { _id: false });

const progressSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: [true, 'Nama proses harus diisi']
  },
  desc: Schema.Types.String,
  status: {
    type: Schema.Types.String,
    enum: {
      values: ['0', '1'],
      message: 'Status hanya boleh diisi 0 atau 1'
    },
    required: [true, 'Tipe quantity harus diisi'],
    default: '0'
  }
});

const orderSchema = new Schema(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Services',
      required: [true, 'Service harus diisi']
    },
    sub_service: [subServiceSchema],
    address: {
      type: addressSchema,
      required: [true, 'Alamat harus diisi']
    },
    pickUpTime: {
      type: Schema.Types.Date,
      required: [true, 'Waktu pickup harus diisi']
    },
    totalPrice: {
      type: Schema.Types.Number,
      required: [true, 'Total harga harus diisi']
    },
    total: {
      type: Schema.Types.Number,
      required: [true, 'Total pesan harus diisi']
    },
    note: Schema.Types.String,
    payment: {
      type: Schema.Types.String,
      required: [true, 'Payment harus diisi']
    },
    id_merchant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Merchant harus diisi']
    },
    id_customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer harus diisi']
    },
    progress: {
      type: [progressSchema],
      required: [true, 'Progress harus diisi']
    }
  },
  {
    collection: 'order',
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

orderSchema.pre('save', function (this: OrderDocument, next: (err?: Error | undefined) => void) {
  if (this.isModified('progress') || this.isNew) {
    this.progress = [
      {
        name: 'Confirmed',
        desc: 'Order telah dikonfirmasi oleh pihak laundry',
        status: '1'
      },
      {
        name: 'Picked up',
        desc: '',
      },
      {
        name: 'In Process',
        desc: '',
      },
      {
        name: 'Shipped',
        desc: '',
      },
      {
        name: 'Delivered',
        desc: '',
      }
    ];
  } else next();
});

const Order: Model<OrderDocument> = mongoose.model<OrderDocument>('Order', orderSchema);

export { OrderInput, OrderDocument };

export default Order;
