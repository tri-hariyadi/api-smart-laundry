import mongoose, { Document, Schema, Model } from 'mongoose';

type RatingDocument = Document & {
  _id: string;
  name: string;
  rating: string;
  comment: string;
  id_service: string;
}

type RatingInput = {
  name: RatingDocument['name'];
  rating: RatingDocument['rating'];
  comment: RatingDocument['comment'];
  id_service: RatingDocument['id_service'];
}

const ratingSchema = new Schema(
  {
    name: {
      type: Schema.Types.String,
      required: [true, 'Nama penilai harus diisi']
    },
    rating: {
      type: Schema.Types.Number,
      required: [true, 'Rating harus diisi']
    },
    comment: Schema.Types.String,
    id_service: {
      type:  Schema.Types.ObjectId,
      required: [true, 'Id service harus diisi']
    }
  },
  {
    collection: 'ratings',
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

const Ratings: Model<RatingDocument> = mongoose.model<RatingDocument>('Ratings', ratingSchema);

export { RatingDocument, RatingInput };

export default Ratings;
