import mongoose, { Document, Schema, Model } from 'mongoose';

const subServicesSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: [true, 'Nama menu harus diisi']
  },
  price: {
    type: Schema.Types.Number,
    required: [true, 'Harga harus diisi']
  },
  banner: Schema.Types.String,
  type: Schema.Types.String
});

type ServicesDocument = Document & {
  _id: string;
  name: string;
  desc: string;
  banner?: Array<string>;
  price: number;
  quantityType: string;
  laundry: string;
  subServices?: {
    _id: string;
    name: string;
    price: number;
    banner?: string;
    type?: string;
  }[],
  promo?: string;
  rating?: number;
}

type ServicesInput = {
  name: ServicesDocument['name'];
  desc: ServicesDocument['desc'];
  price: ServicesDocument['price'];
  quantityType: ServicesDocument['quantityType'];
  laundry: ServicesDocument['laundry'];
  banner?: ServicesDocument['banner'];
  subServices?: ServicesDocument['subServices'];
  promo?: ServicesDocument['promo'];
  rating?: ServicesDocument['rating'];
}

const servicesSchema = new Schema(
  {
    name: {
      type: Schema.Types.String,
      required: [true, 'Nama menu harus diisi']
    },
    desc: {
      type: Schema.Types.String,
      required: [true, 'Deskripsi menu harus diisi']
    },
    banner: [{
      type: Schema.Types.String
    }],
    price: {
      type: Schema.Types.Number,
      required: [true, 'Harga harus diisi']
    },
    quantityType: {
      type: Schema.Types.String,
      enum: {
        values: ['kg', 'satuan'],
        message: 'Tipe quantity hanya boleh diisi kg atau satuan'
      },
      required: [true, 'Tipe quantity harus diisi']
    },
    laundry: {
      type:  Schema.Types.ObjectId,
      ref: 'Laundry',
      required: [true, 'Pemilik laundry harus diisi']
    },
    subServices: [subServicesSchema],
    promo: {
      type:  Schema.Types.ObjectId,
      ref: 'Promo'
    },
    ratings: [{
      type: Schema.Types.ObjectId,
      ref: 'Ratings'
    }]
  },
  {
    collection: 'services',
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

const Services: Model<ServicesDocument> = mongoose.model<ServicesDocument>('Services', servicesSchema);

export { ServicesInput, ServicesDocument };

export default Services;
