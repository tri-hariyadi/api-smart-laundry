import { unlinkSync } from 'fs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import responseWrapper, { internalServerError } from '../utils/responseWrapper';
import IUserController from '../interfaces/controller.user.interface';
import User, { UserDocument, UserInput } from '../models/UserModel';
import config, { IConfig } from '../utils/config';
import ValidationException from '../exceptions/ValidationExeption';
import JwtSign from '../utils/jwtSign';
import client from '../utils/initRedis';
import ErrorMessage from '../utils/errorMessage';

const baseUrl: any = config(process.env.NODE_ENV as keyof IConfig).API_BASE_URl;
interface DataPayload { aud: string }

class UserController implements IUserController {
  register(req: Request, res: Response): void {
    const { fullName, email, phoneNumber, address, password, role } = req.body;
    const userInput: UserInput = {
      fullName, email, phoneNumber, address, password, role
    };
    const user = new User(userInput);
    const error = user.validateSync();

    if (error) new ValidationException().validationError(error, res);
    else user.save((err) => {
      if (err) return res.status(500).send(internalServerError);
      return res.status(200).send(responseWrapper( null, 'Register berhasil dilakukan', 200));
    });
  }

  login(req: Request, res: Response): void {
    const { email, password } = req.body;
    User.findOne({ email: email }).exec((err, result) => {
      if (err) {
        return res.status(500).send(internalServerError);
      } else if (!result) {
        setTimeout(() => {
          res.status(404).send(responseWrapper(null, 'Email tidak terdaftar', 404));
        }, 5000);
      } else {
        result.comparePassword(password, (matchError, isMatch) => {
          if (matchError) {
            return res.status(400).send(responseWrapper(null, 'Oops, ada yang salah', 400));
          } else if (!isMatch) {
            return res.status(400).send(responseWrapper(null, 'Password tidak valid', 400));
          }
          new JwtSign(result).createToken()
            .then(response => res.status(200).send(responseWrapper(response, 'Berhasil Login', 200)))
            .catch(() => res.status(500).send(internalServerError));
        });
      }
    });
  }

  logout(req: Request, res: Response): void {
    try {
      const { dataToken } = req.body;
      const bearerHeader = req.headers['authorization'];
      if (!bearerHeader) throw new Error('Autentikasi token tidak ada');
      const bearerToken = bearerHeader.split(' ')[1];
      const payload = jwt.decode(bearerToken, { complete: true })?.payload as DataPayload;
      client.lRem(payload.aud, 1, JSON.stringify(dataToken))
        .then(reply => {
          if (reply > 0) res.status(200).send(responseWrapper(null, 'Berhasil logout', 200));
          else res.status(401).send(responseWrapper(null, 'Autentikasi token tidak valid', 401));
        })
        .catch(() => {
          throw new Error('Internal Server Error');
        });
    } catch (error) {
      const message = ErrorMessage.getErrorMessage(error);
      if (message) res.status(400).send(responseWrapper(400, message, 400));
      else res.status(500).send(internalServerError);
    }
  }

  changeFcmToken(req: Request, res: Response): void {
    const { userId, fcmToken } = req.body;
    if (!userId) {
      res.status(400).send(responseWrapper(null, 'Id user harus diisi', 400));
    } else if (!fcmToken) {
      res.status(400).send(responseWrapper(null, 'Invalid FcmToken', 400));
    } else {
      User.updateOne({ _id: userId }, { fcmToken }).exec((err) => {
        if (err) return res.status(500).send(internalServerError);
        return res.status(200).send(responseWrapper( null, 'Berhasil update fcmToken', 200));
      });
    }
  }

  updateUser(req: Request, res: Response): void {
    const { id } = req.params;
    const { fullName, email, phoneNumber, address, password, role } = req.body;
    const userInput: UserInput = {
      fullName, email, phoneNumber, address, password, role
    };
    const user = new User(userInput);
    const error = user.validateSync();
    const errMessage = new ValidationException().validate(error, '-password^required');
    if (errMessage) res.status(400).send(responseWrapper(null, errMessage, 400));
    else User.updateOne({ _id: id }, userInput).exec((err) => {
      if (err) return res.status(500).send(internalServerError);
      return res.status(200).send(responseWrapper( null, 'Update profile berhasil', 200));
    });
  }

  updatePassword(req: Request, res: Response): void {
    const { id } = req.params;
    const { password } = req.body;
    const user = new User({ password });
    const error = user.validateSync();
    const errMessage = new ValidationException().validate(
      error,
      '-fullName, -email, -phoneNumber, -address, -role'
    );
    if (errMessage) res.status(400).send(responseWrapper(null, errMessage, 400));
    else User.updateOne({ _id: id }, { password }).exec((err) => {
      if (err) return res.status(500).send(internalServerError);
      return res.status(200).send(responseWrapper( null, 'Update password berhasil', 200));
    });
  }

  updatePhotoProfile(req: Request, res: Response): void {
    const { id } = req.params;
    if (!req.file) {
      res.status(400).send(responseWrapper(null, 'File tidak diupload', 400));
    } else {
      User.updateOne({ _id: id }, {$set: { photoProfile: `${baseUrl}/public/images/users/${req.file.filename}` }})
        .exec((err) => {
          if (err) {
            unlinkSync(`public/images/users/${req.file?.filename}`);
            return res.status(500).send(internalServerError);
          }
          return res.status(200).send(responseWrapper( null, 'Update profile berhasil', 200));
        });
    }
  }

  getAllUsers(req: Request, res: Response): void {
    User.find({}, '-password').sort('-createdAt').exec((err, response) => {
      if (err) res.status(500).send(internalServerError);
      else {
        if (response) res.status(200).send(responseWrapper(
          response, 'Berhasil mendapatkan semua user', 200
        ));
        else res.status(404).send(responseWrapper(null, 'User tidak ditemukan', 404));
      }
    });
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    const { id, role } = req.params;
    if (role === 'user') {
      User.findOne({_id: id}, '-password', {}).populate('role')
        .exec((err, result) => {
          if (err) return res.status(500).send(internalServerError);
          if (!result) return res.status(400).send(responseWrapper(null,
            `Data dengan id ${id}, tidak ditemukan atau tidak valid`, 400));
          return res.status(200).send(responseWrapper(result, 'Berhasil mendapatkan data user', 200));
        });
    } else {
      User.aggregate([
        {
          $match: {
            '_id': new mongoose.Types.ObjectId(id)
          }
        },
        {
          '$lookup': {
            'from': 'laundry',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$user_id', '$$userId'] }
                    ],
                  },
                },
              },
              { $unset: ['__v', 'createdAt', 'updatedAt'] }
            ],
            'as': 'laundry',
          }
        },
        {
          '$lookup': {
            'from': 'roles',
            let: { role_id: '$role' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$role_id'] }
                    ],
                  },
                },
              },
              { $unset: ['__v', 'createdAt', 'updatedAt'] }
            ],
            'as': 'role'
          }
        },
        { $unwind: '$laundry' },
        { $unwind: '$role' },
        { $unset: ['__v', 'password'] }
      ]).exec(function(err, results){
        if (err) return res.status(500).send(internalServerError);
        if (!results.length) return res.status(400).send(responseWrapper(null,
          `Data dengan id ${id}, tidak ditemukan atau tidak valid`, 400));
        return res.status(200).send(responseWrapper(results[0], 'Berhasil mendapatkan data user', 200));
      });
    }

  }

  deleteUser(req: Request, res: Response): void {
    const { id } = req.params;
    User.findOneAndDelete({ _id: id }, {}, (err, result) => {
      if (err) {
        if (err.message) return res.status(400).send(responseWrapper(null,
          `Data dengan id ${id}, tidak ditemukan atau tidak valid`, 400));
        return res.status(500).send(internalServerError);
      } else {
        if (result?.photoProfile) {
          const imgPath = result.photoProfile.split('/');
          const imgLink = imgPath.splice(3, imgPath.length).join('/');
          unlinkSync(imgLink);
        }
        return res.status(200).send(responseWrapper(null, 'Berhasil menghapus data user', 200));
      }
    });
  }

  refreshToken(req: Request, res: Response): void {
    try {
      const bearerHeader = req.headers['authorization'];
      const bearerToken = bearerHeader?.split(' ')[1] as string;
      const payload = jwt.decode(bearerToken, { complete: true })?.payload as DataPayload;
      new JwtSign({ id: payload.aud } as UserDocument).createToken()
        .then(response => res.status(200).send(responseWrapper(response, 'Refresh token berhasil', 200)))
        .catch(() => res.status(500).send(internalServerError));
    } catch (error) {
      const message = ErrorMessage.getErrorMessage(error);
      if (message) res.status(400).send(responseWrapper(400, message, 400));
      else res.status(500).send(internalServerError);
    }
  }

}

export default new UserController();
