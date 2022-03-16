import mongoose, { Schema, Model, Document } from 'mongoose';

type RoleDocument = Document & {
  code: number;
  name: string,
  description: string | null;
};

type RoleInput = {
  code: RoleDocument['code'];
  name: RoleDocument['name'];
  description: RoleDocument['description'];
};

const roleSchema = new Schema(
  {
    code: {
      type: Schema.Types.Number,
      required: [true, 'Code role is required'],
      unique: [true, 'Code role sudah digunakan, silahkan input role lain.'],
    },
    name: {
      type: Schema.Types.String,
      required: [true, 'Nama role harus diinput.'],
      unique: [true, 'Nama role sudah digunakan, silahkan input nama role lain.'],
    },
    description: {
      type: Schema.Types.String,
      default: null,
    }
  },
  {
    collection: 'roles',
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

const Role: Model<RoleDocument> = mongoose.model<RoleDocument>('Role', roleSchema);

export { RoleInput, RoleDocument };

export default Role;
