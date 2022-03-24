import mongoose, { Model, Document, Schema } from 'mongoose';

type PromoDocument = Document & {
  name: string;
  desc: string;
  start: Date;
  end: Date;
  diskon: number;
};

type PromoInput = {
  name: PromoDocument['name'];
  desc: PromoDocument['desc'];
  start: PromoDocument['start'];
  end: PromoDocument['end'];
  diskon: PromoDocument['diskon'];
};

const promoSchema = new Schema(
  {
    name: {
      type: Schema.Types.String,
      required: [true, 'Nama promo harus diisi']
    },
    desc: {
      type: Schema.Types.String,
      required: [true, 'Diskripsi promo harus diisi']
    },
    start: {
      type: Schema.Types.String,
      required: [true, 'Start periode promo harus diisi']
    },
    end: {
      type: Schema.Types.String,
      required: [true, 'End periode promo harus diisi']
    },
    diskon: {
      type: Schema.Types.Number,
      required: [true, 'Diskon promo harus diisi']
    }
  },
  {
    collection: 'promo',
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

const Promo: Model<PromoDocument> = mongoose.model<PromoDocument>('Promo', promoSchema);

export { PromoInput, PromoDocument };

export default Promo;
