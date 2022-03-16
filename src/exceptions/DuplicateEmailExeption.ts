import { Request, Response, NextFunction } from 'express';
import User from '../models/UserModel';
import response, { internalServerError } from '../utils/responseWrapper';

const DuplicateEmailExeption = (req: Request, res: Response, next: NextFunction): void => {
  User.findOne({
    email: req.body.email
  }).exec((err, result) => {
    if (err) return res.status(500).send(internalServerError);
    if (result) return res.status(400).send(response(
      null, 'Email telah terdaftar, silahkan gunakan email lain', 400));
    next();
  });
};

export default DuplicateEmailExeption;
