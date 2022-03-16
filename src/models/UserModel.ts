import mongoose, { Schema, Model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
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

type UserDocument = Document & {
  _id: string,
  fullName: string;
  email: string,
  phoneNumber: string,
  address: {
    city: string,
    street: string,
    lat: number,
    long: number
  },
  photoProfile?: string,
  password: string,
  role: Schema.Types.ObjectId,
  comparePassword(password: string, next: (err: Error | null, same: boolean | null) => void): void;
}

type UserInput = {
  fullName: UserDocument['fullName'];
  email: UserDocument['email'],
  phoneNumber: UserDocument['phoneNumber'],
  address: UserDocument['address'],
  password: UserDocument['password'],
  role: UserDocument['role']
}

const phoneValidators = [
  { validator: function (v: string) { return v.length >= 10; }, msg: 'Nomor HP tidak kurang dari 10 digits' },
  { validator: function (v: string) { return v.length <= 15; }, msg: 'Nomor HP tidak lebih dari 15 digits' },
  { validator: function (v: string) { return /^[0-9]+$/.test(v); }, msg: 'Nomor HP tidak valid' }
];

const userSchema = new Schema(
  {
    fullName: {
      type: Schema.Types.String,
      required: [true, 'Nama harus diisi'],
    },
    email: {
      type: Schema.Types.String,
      required: [true, 'Email harus diisi'],
      unique: true,
      maxlength: 100,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Email tidak valid, silahkan isi alamat email yang valid'
      }
    },
    phoneNumber: {
      type: Schema.Types.String,
      required: [true, 'Nomor HP harus diisi'],
      validate: phoneValidators
    },
    address: {
      type: addressSchema,
      required: [true, 'Alamat harus diisi']
    },
    photoProfile: {
      type: Schema.Types.String
    },
    password: {
      type: Schema.Types.String,
      required: [true, 'Password harus diisi'],
      minlength: [8, 'Password minimal 8 karakter']
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Role harus diisi'],
      index: true
    }
  },
  {
    collection: 'users',
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

userSchema.pre('save', function (this: UserDocument, next: (err?: Error | undefined) => void) {
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, (saltError, salt) => {
      if (saltError) return next(saltError);
      else bcrypt.hash(this.password, salt, (hashError: Error, hash: string) => {
        if (hashError) return next(hashError);
        this.password = hash;
        next();
      });
    });
  } else next();
});

userSchema.pre('updateOne', function (next: (err?: Error | undefined) => void) {
  const update = this.getUpdate();
  if (update.password) {
    bcrypt.genSalt(10, (saltError, salt) => {
      if (saltError) return next(saltError);
      else bcrypt.hash(update.password, salt, (hashError: Error, hash: string) => {
        if (hashError) return next(hashError);
        this.getUpdate().password = hash;
        next();
      });
    });
  } else next();
});

userSchema.methods.comparePassword = function (
    password: string,
    next: (err: Error | null, same: boolean | null) => void
) {
  bcrypt.compare(password, this.password, function (err: Error, isMatch: boolean) {
    if (err) return next(err, null);
    return next(null, isMatch);
  });
};

const User: Model<UserDocument> = mongoose.model<UserDocument>('User', userSchema);

export { UserInput, UserDocument };

export default User;
