import { Request, Response } from 'express';
import responseWrapper, { internalServerError } from '../utils/responseWrapper';
import IRoleController from '../interfaces/controller.role.interface';
import Role, { RoleInput } from '../models/RoleModel';
import ValidationException from '../exceptions/ValidationExeption';

class RoleController implements IRoleController {
  create(req: Request, res: Response): void {
    const { code, name, description } = req.body;
    const roleInput: RoleInput = {
      code, name, description
    };
    const role = new Role(roleInput);

    const error = role.validateSync();
    if (error) new ValidationException().validationError(error, res);
    else role.save((err) => {
      if (err) {
        if (JSON.parse(JSON.stringify(err)).code === 11000) return res.status(400).send(responseWrapper(
          null, 'Code role sudah digunakan, silahkan input role lain.', 400
        ));
        return res.status(500).send(internalServerError);
      }
      res.status(200).send(responseWrapper(
        { Message: 'Berhasil menyimpan Role' }, 'Berhasil menyimpan Role', 200
      ));
    });
  }

  getRoles(req: Request, res: Response): void {
    Role.find().sort('-createdAt').exec((err, response) => {
      if (err) res.status(500).send(internalServerError);
      else {
        if (response) res.status(200).send(responseWrapper(
          response, 'Berhasil mendapatkan semua role.', 200
        ));
        else res.status(404).send(responseWrapper(null, 'Role tidak ditemukan.', 404));
      }
    });
  }

  getRole(req: Request, res: Response): void {
    const { id } = req.params;
    if (!id) res.send(400).send(responseWrapper(null, 'Role id harus dikirim.', 400));
    else Role.findOne({ _id: id }, {}, {}, (err, result) => {
      if (err) {
        res.status(500).send(internalServerError);
      } else {
        if (result) {
          res.status(200).send(responseWrapper(result, 'Berhasil mendapatkan role', 200));
        } else {
          res.status(400).send(responseWrapper(null, `Role dengan id ${id} tidak ditemukan`, 400));
        }
      }
    });
  }

  updateRole(req: Request, res: Response): void {
    const { id } = req.params;
    const { code, name, description } = req.body;
    const roleInput: RoleInput = {
      code, name, description
    };
    const error = new Role(roleInput).validateSync();
    if (error) new ValidationException().validationError(error, res);
    else Role.updateOne({ _id: id }, roleInput, { upsert: false }, (err) => {
      if (err) return res.status(500).send(internalServerError);
      res.status(200).send(responseWrapper(
        { Message: 'Berhasil update role' },
        'Berhasil update role.',
        200
      ));
    });
  }

  deleteRole(req: Request, res: Response): void {
    const { id } = req.params;
    if (!id) res.send(400).send(responseWrapper(null, 'Role id harus dikirim.', 400));
    else Role.deleteOne({ _id: id }, {}, (err) => {
      if (err) res.status(500).send(internalServerError);
      res.status(200).send(responseWrapper(
        { Message: 'Berhasil hapus role' },
        'Berhasil hapus role.',
        200
      ));
    });
  }

}

export default new RoleController();
