import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import responseWrapper, { internalServerError } from '../utils/responseWrapper';
import IUserController from '../interfaces/controller.user.interface';
import TokenData from '../interfaces/tokenData.interface';
import DataStoredInToken from '../interfaces/dataStoredInToken';
import User, { UserDocument, UserInput } from '../models/UserModel';
import config, { IConfig } from '../utils/config';
import ValidationException from '../exceptions/ValidationExeption';

const baseUrl = config(process.env.NODE_ENV as keyof IConfig).API_BASE_URl;

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
        res.status(404).send(responseWrapper(null, 'Email tidak terdaftar', 404));
      } else {
        result.comparePassword(password, (matchError, isMatch) => {
          if (matchError) {
            return res.status(400).send(responseWrapper(null, 'Oops, ada yang salah', 400));
          } else if (!isMatch) {
            return res.status(400).send(responseWrapper(null, 'Password tidak valid', 400));
          }

          const createCookie = (tokenData: TokenData): string => {
            return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
          };

          const createToken = (user: UserDocument): TokenData => {
            const EXPIRES_IN = 60 * 60;
            const SECRET = config(process.env.NODE_ENV as keyof IConfig)?.SECRET || '';
            const dataStoredInToken: DataStoredInToken = {
              id: user._id
            };
            return {
              expiresIn: EXPIRES_IN,
              token: jwt.sign(dataStoredInToken, SECRET, { expiresIn: EXPIRES_IN })
            };
          };

          const tokenData = createToken(result);
          res.setHeader('Set-Cookie', [createCookie(tokenData)]);
          return res.status(200).send(responseWrapper(null, 'Berhasil Login', 200));
        });
      }
    });
  }

  logout(req: Request, res: Response): void {
    res.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
    res.status(200).send(responseWrapper(null, 'Anda telah logout', 200));
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
      User.updateOne({ _id: id }, {$set: { photoProfile: `${baseUrl}/public/images/user/${req.file.filename}` }})
        .exec((err) => {
          if (err) return res.status(500).send(internalServerError);
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

  getUserById(req: Request, res: Response): void {
    const { id } = req.params;
    User.findOne({ _id: id }, '-password', {}, (err, result) => {
      if (err) {
        if (err.message) return res.status(400).send(responseWrapper(null,
          `Data dengan id ${id}, tidak ditemukan atau tidak valid`, 400));
        return res.status(500).send(internalServerError);
      } else if (!result) {
        return res.status(404).send(responseWrapper(null, 'Data user tidak ditemukan', 404));
      }
      return res.status(200).send(responseWrapper(result, 'Berhasil mendapatkan data user', 200));
    });
  }

  deleteUser(req: Request, res: Response): void {
    const { id } = req.params;
    User.deleteOne({ _id: id }, {}, (err) => {
      if (err) {
        if (err.message) return res.status(400).send(responseWrapper(null,
          `Data dengan id ${id}, tidak ditemukan atau tidak valid`, 400));
        return res.status(500).send(internalServerError);
      } else {
        return res.status(200).send(responseWrapper(null, 'Berhasil menghapus data user', 200));
      }
    });
  }

}

export default new UserController();
