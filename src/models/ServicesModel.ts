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
}, { _id: false });

type ServicesDocument = Document & {
  _id: string;
  name: string;
  desc: string;
  banner: string;
  price: number;
  subServices?: {
    _id: string;
    name: string;
    price: number;
    banner: string;
    type?: string;
  },
  promo?: string
}

type ServicesInput = {
  name: ServicesDocument['name'];
  desc: ServicesDocument['desc'];
  banner: ServicesDocument['banner'];
  price: ServicesDocument['price'];
  subServices?: ServicesDocument['subServices'];
  promo?: ServicesDocument['promo'];
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
    banner: {
      type: Schema.Types.String,
      required: [true, 'Banner menu harus diisi']
    },
    price: {
      type: Schema.Types.Number,
      required: [true, 'Harga harus diisi']
    },
    subServices: subServicesSchema,
    promo: Schema.Types.ObjectId
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
