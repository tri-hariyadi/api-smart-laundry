import mongoose, { Model, Document, Schema } from 'mongoose';

type PromoDocument = Document & {
  name: string;
  desc: string;
  start: Date;
  end: Date;
  diskon: {
    typeDiskon: string;
    valueDiskon: number;
  };
  minOrder?: {
    typeMinOrder: string;
    valueMinOrder: number;
  },
  laundry_id: string;
};

type PromoInput = {
  name: PromoDocument['name'];
  desc: PromoDocument['desc'];
  start: PromoDocument['start'];
  end: PromoDocument['end'];
  diskon: PromoDocument['diskon'];
  minOrder: PromoDocument['minOrder'];
  laundry_id: PromoDocument['laundry_id'];
};

const diskonSchema = new Schema({
  typeDiskon: {
    type: Schema.Types.String,
    enum: {
      values: ['percent', 'nominal'],
      message: 'Tipe diskon hanya boleh diisi persen atau nominal'
    },
    required: [true, 'Tipe diskon harus diisi']
  },
  valueDiskon: {
    type:Schema.Types.Number,
    required: [true, 'Value diskon harus diisi']
  }
}, { _id: false });

const minimumOrderSchema = new Schema({
  typeMinOrder: {
    type: Schema.Types.String,
    enum: {
      values: ['weight', 'price'],
      message: 'Tipe minimal order hanya boleh weight atau price'
    },
    required: 'Tipe minimal order harus diisi'
  },
  valueMinOrder: {
    type: Schema.Types.Number,
    required: [true, 'Value minimum order harus diisi']
  }
}, { _id: false });

const checkTypeDiskon = [
  {
    validator: function (value: { typeDiskon: string; valueDiskon: number }) {
      return !(value.typeDiskon === 'percent' && (value.valueDiskon < 1 || value.valueDiskon > 100));
    },
    msg: 'Diskon dengan tipe persen harus diisi dengan value 1% sampai 100%'
  },
  {
    validator: function (value: { typeDiskon: string; valueDiskon: number }) {
      return !(value.typeDiskon === 'nominal' && (value.valueDiskon < 1));
    },
    msg: 'Diskon dengan tipe nominal harus diisi dengan value minimal 1 rupiah'
  },
];

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
      type: diskonSchema,
      required: [true, 'Diskon promo harus diisi'],
      validate: checkTypeDiskon
    },
    minOrder: minimumOrderSchema,
    laundry_id: {
      type:  Schema.Types.ObjectId,
      ref: 'Laundry',
      required: [true, 'Pemilik laundry harus diisi']
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
