import { Request, Response } from 'express';
import responseWrapper, { internalServerError } from '../utils/responseWrapper';
import IServicesController from '../interfaces/controller.services.interface';
import Services, { ServicesInput } from '../models/ServicesModel';
import ValidationException from '../exceptions/ValidationExeption';
import config, { IConfig } from '../utils/config';
import Distance from '../utils/distance';

const baseUrl = config(process.env.NODE_ENV as keyof IConfig).API_BASE_URl;
type File = {
    fieldname: '',
    originalname: '',
    encoding: '',
    mimetype: '',
    destination: '',
    filename: '',
    path: '',
    size: 0
  }

interface IServices {
  _id: string;
  name: string;
  desc: string;
  banner: Array<string>;
  price: number;
  subServices?: {
    _id: string;
    name: string;
    price: number;
    banner: string;
    type: string;
  },
  laundry: {
    user_id: {
      fullName: string,
      email: string,
      phoneNumber: string,
      address: {
        city: string,
        street: string,
        lat: number,
        long: number
      },
      role: string,
    },
    name: string,
    domain: string,
  };
  promo?: {
    diskon: {
      typeDiskon: string,
      valueDiskon: number
    },
  },
  distance: number
}

class ServicesController implements IServicesController {
  create(req: Request, res: Response): void {
    const banner: Array<string> = [];
    if (req.files?.length) {
      for (let i = 0; i < req.files.length; i++) {
        banner.push(`${baseUrl}/public/images/services/${(req.files as Array<File>)[i].filename}`);
      }
    }
    const { name, desc, price, subServices, laundry } = JSON.parse(req.body.data);
    const serviceInput: ServicesInput = {
      name, desc, banner, price, subServices, laundry
    };
    const services = new Services(serviceInput);
    const error = services.validateSync();

    if (error) new ValidationException().validationError(error, res);
    else services.save((err) => {
      if (err) return res.status(500).send(internalServerError);
      return res.status(200).send(responseWrapper( null, 'Service berhasil ditambahkan', 200));
    });
  }

  async getServices(req: Request, res: Response): Promise<void> {
    const { lat, long } = req.params;
    const data: Array<IServices> = [];
    const services: Array<IServices> = await Services.find()
      .populate('promo', '-_id diskon')
      .populate({
        path: 'laundry',
        select: '-_id -createdAt -updatedAt -__v',
        populate: {
          path: 'user_id',
          select: '-_id -password -createdAt -updatedAt -__v',
        }
      });
    if (!services.length) res.status(500).send(internalServerError);
    else {
      services.filter(item => {
        const lat2 = item.laundry.user_id.address.lat;
        const long2 = item.laundry.user_id.address.long;
        const distance = new Distance(Number(lat), Number(long), lat2, long2).getDistance();
        if (distance < 18) {
          const dataItem = {
            _id: item._id,
            name: item.name,
            banner: item.banner[0],
            price: item.price,
            city: item.laundry.user_id.address.city,
            diskon: item.promo?.diskon
          };
          data.push({...JSON.parse(JSON.stringify(dataItem)), distance});
        }
      });
      res.status(200).send(responseWrapper(
        data.length? data : null, 'Success get Services', 200
      ));
    }
  }

  getService(req: Request, res: Response): void {
    const { id } = req.params;
    Services.findOne({ _id: id }).populate({
      path: 'laundry',
      select: '-_id -createdAt -updatedAt -__v',
      populate: {
        path: 'user_id',
        select: '-_id -password -createdAt -updatedAt -__v',
      }
    }).exec((err, result) => {
      if (err) return res.status(500).send(internalServerError);
      res.status(200).send(responseWrapper(result, 'Success get service', 200));
    });
  }

  update(req: Request, res: Response): void {
    const { id } = req.params;
    const { name, desc, price, subServices, laundry, banner } = JSON.parse(req.body.data);
    let Banner: Array<string> = [];
    if (banner && banner.length) Banner = [...banner];
    if (req.files?.length) {
      for (let i = 0; i < req.files.length; i++) {
        Banner.push(`${baseUrl}/public/images/services/${(req.files as Array<File>)[i].filename}`);
      }
    }
    const serviceInput: ServicesInput = {
      name, desc, banner: Banner, price, subServices, laundry
    };
    const services = new Services(serviceInput);
    const error = services.validateSync();
    const errMessage = new ValidationException().validate(error, '-laundry^required');

    if (errMessage) res.status(400).send(responseWrapper(null, errMessage, 400));
    else Services.updateOne({ _id: id }, serviceInput).exec((err) => {
      if (err) res.status(500).send(internalServerError);
      res.status(200).send(responseWrapper(null, 'Berhasil memperbarui service', 200));
    });
  }

  addPromo(req: Request, res: Response): void {
    const { promo } = req.body;
    const { id } = req.params;
    if (!promo) res.status(400).send(responseWrapper(null, 'Promo harus diisi', 400));
    else Services.findOneAndUpdate({ _id: id }, { promo }).exec(err => {
      if (err) {
        if (err.message) return res.status(400).send(responseWrapper(null,
          `Data dengan id ${id}, tidak ditemukan atau tidak valid`, 400));
        res.status(500).send(internalServerError);
      }
      res.status(200).send(responseWrapper(null, 'Berhasil menambahkan promo', 200));
    });
  }

  delete(req: Request, res: Response): void {
    const { id } = req.params;
    Services.findOneAndDelete({ _id: id }).exec((err, result) => {
      if (err) {
        return res.status(500).send(internalServerError);
      } else {
        if (!result) return res.status(400).send(responseWrapper(null,
          `Service dengan id ${id}, tidak ditemukan atau mungkin telah dihapus`, 400));
        res.status(200).send(responseWrapper(null, 'Berhasil menghapus service', 200));
      }
    });
  }

}

export default new ServicesController();
