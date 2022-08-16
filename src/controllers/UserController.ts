/* eslint-disable no-console */
import { unlinkSync } from 'fs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
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
    else {
      User.findOne({ _id: id }).exec((err, result) => {
        if (err) return res.status(500).send(internalServerError);
        if (result) {
          result.comparePassword(password, (matchError, isMatch) => {
            if (matchError) {
              return res.status(400).send(responseWrapper(null, 'Oops, ada yang salah', 400));
            } else if (isMatch) {
              return res.status(400).send(responseWrapper(
                null, 'Password tidak boleh sama dengan password yang lama', 400));
            }
            bcrypt.genSalt(10, (saltError, salt) => {
              if (saltError) return res.status(400).send(responseWrapper( null, 'Gagal ganti password', 400));
              else bcrypt.hash(password, salt, (hashError: Error, hash: string) => {
                if (hashError) return res.status(400).send(responseWrapper( null, 'Gagal ganti password', 400));
                User.updateOne({ _id: id }, { password: hash }).exec((err) => {
                  if (err) return res.status(500).send(internalServerError);
                  client.DEL(id);
                  return res.status(200).send(responseWrapper( null, 'Ganti password berhasil', 200));
                });
              });
            });
          });
        } else res.status(400).send(responseWrapper( null, 'Gagal ganti password', 400));
      });
    }
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

  recoveryPassword(req: Request, res: Response): void {
    User.findOne({ email: req.body.email }).exec((err, result) => {
      if (err) return res.status(500).send(internalServerError);
      if (result) {
        const pattern = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const newGeneratePassword = Array(8).fill(pattern).map((x) => x[Math.floor(Math.random() * x.length)]).join('');
        bcrypt.genSalt(10, (saltError, salt) => {
          if (saltError) return res.status(400).send(responseWrapper(
            { Message: 'Gagal recovery password' },
            'Gagal recovery password', 400
          ));
          else bcrypt.hash(newGeneratePassword, salt, (hashError: Error, hash: string) => {
            if (hashError) return res.status(400).send(responseWrapper(
              { Message: 'Gagal recovery password' },
              'Gagal recovery password', 400
            ));
            User.updateOne({ email: req.body.email }, { password: hash }).exec((err) => {
              if (err) return res.status(500).send(internalServerError);
              const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                  type: 'OAuth2',
                  user: 'trihariyadi24@gmail.com',
                  clientId: process.env.GMAIL_CLIENT_ID,
                  clientSecret: process.env.GMAIL_SECRET,
                  refreshToken: process.env.GMAIL_REFRESH_TOKEN,
                  accessToken: process.env.GMAIL_ACCESS_TOKEN
                }
              });

              transporter.set('oauth2_provision_cb', (user, renew, callback) => {
                // const accessToken = userTokens[user];
                if (!user) {
                  return callback(new Error('Unknown user'));
                } else {
                  return callback(null, user);
                }
              });

              transporter.on('token', token => {
                console.log('A new access token was generated');
                console.log('User: %s', token.user);
                console.log('Access Token: %s', token.accessToken);
                console.log('Expires: %s', new Date(token.expires));
              });

              const mailOptions = {
                from: 'no-replay@gmail.com',
                to: req.body.email,
                subject: 'Recovery Password Smart Laundry',
                html: `
                  <h2>Halo ${result.fullName}</h2>
                  </br>
                  <p>Ini adalah password baru hasil recovery untuk login ke aplikasi smart laundry, simpan
                  dan jangan dibagikan kepada siapa pun</p>
                  </br>
                  <p>Password: ${newGeneratePassword}</p>
                  </br>
                  <p>Terima kasih</p>
                `
              };

              transporter.sendMail(mailOptions, (err, info) => {
                if (err) throw err;
                console.log('Email sent: ' + info.response);
              });
              res.status(200).send(responseWrapper(
                { Message: 'Password berhasil di recovery, silahkan cek email kamu' },
                'Password berhasil di recovery, silahkan cek email kamu', 200
              ));
            });
          });
        });
      } else {
        res.status(400).send(responseWrapper(
          { Message: 'Gagal recovery password' },
          'Gagal recovery password, email tidak valid atau tidak terdaftar', 400
        ));
      }
    });
  }

}

export default new UserController();
