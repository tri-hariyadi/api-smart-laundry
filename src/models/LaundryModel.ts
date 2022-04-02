import mongoose, { Schema, Model, Document } from 'mongoose';

type LaundryDocument = Document & {
  user_id: string,
  name: string,
  domain: string
}

type LaundryInput = {
  user_id: LaundryDocument['user_id'],
  name: LaundryDocument['name'],
  domain: LaundryDocument['domain']
}

const laundrySchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User harus diisi'],
      index: true,
      unique: true
    },
    name: {
      type: Schema.Types.String,
      required: [true, 'Nama laundry harus diisi']
    },
    domain: {
      type: Schema.Types.String,
      required: [true, 'Domain harus diisi']
    }
  },
  {
    collection: 'laundry',
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
    }
  }
);

const Laundry: Model<LaundryDocument> = mongoose.model<LaundryDocument>('Laundry', laundrySchema);

export { LaundryInput, LaundryDocument };

export default Laundry;
