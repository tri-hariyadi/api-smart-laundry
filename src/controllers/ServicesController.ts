import { unlinkSync } from 'fs';
import { Request, Response } from 'express';
import responseWrapper, { internalServerError } from '../utils/responseWrapper';
import IServicesController from '../interfaces/controller.services.interface';
import Services, { ServicesInput } from '../models/ServicesModel';
import Ratings, { RatingInput } from '../models/RatingModel';
import Order from '../models/OrderModel';
import ValidationException from '../exceptions/ValidationExeption';
import config, { IConfig } from '../utils/config';
import Distance from '../utils/distance';
import ErrorMessage from '../utils/errorMessage';

const baseUrl = config(process.env.NODE_ENV as keyof IConfig).API_BASE_URl + '/';
const imgPath = 'public/images/services/';
type File = {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
  }

type SubServices = {
  _id: string;
  name: string;
  price: number;
  banner: string;
  type: string;
}

interface ISubServices {
  subServices: Array<SubServices>;
}

interface IServices {
  _id: string;
  name: string;
  desc: string;
  banner: Array<string>;
  price: number;
  subServices?: ISubServices,
  laundry: {
    user_id: {
      fullName: string;
      email: string;
      phoneNumber: string;
      address: {
        city: string;
        street: string;
        lat: number;
        long: number
      };
      role: string;
    };
    name: string;
    domain: string;
    status: boolean;
  };
  promo?: {
    end: string;
    diskon: {
      typeDiskon: string;
      valueDiskon: number;
    },
  } | null,
  distance: number;
}

class ServicesController implements IServicesController {
  create(req: Request, res: Response): void {
    const banner: Array<string> = [];
    if (req.files?.length) {
      for (let i = 0; i < req.files.length; i++) {
        banner.push(`${baseUrl + imgPath + (req.files as Array<File>)[i].filename}`);
      }
    }
    const { name, desc, price, quantityType, subServices, laundry, promo } = JSON.parse(req.body.data);
    const serviceInput: ServicesInput = {
      name, desc, banner, price, quantityType, subServices, laundry, promo
    };
    const services = new Services(serviceInput);
    const error = services.validateSync();

    if (error) new ValidationException().validationError(error, res);
    else services.save((err) => {
      if (err) return res.status(500).send(internalServerError);
      return res.status(200).send(responseWrapper( null, 'Service berhasil ditambahkan', 200));
    });
  }

  async addSubservices(req: Request, res: Response): Promise<void> {
    let services: ISubServices | null;
    let banner: string;
    const { id } = req.params;
    if (req.file) {
      try {
        services = await Services.findOne({ _id: id }, 'subServices -_id');
        if (!services) {
          throw new Error(`Service dengan id ${id}, tidak ditemukan`);
        } else {
          banner = `${baseUrl + imgPath + req.file.filename}`;
          const subServices: SubServices = JSON.parse(req.body.data).subServices;
          subServices.banner = banner;
          const data: Array<SubServices> = [...services.subServices, subServices];
          Services.updateOne({ _id: id }, { subServices: data })
            .exec((err) => {
              if (err) {
                unlinkSync(`${imgPath + req.file?.filename}`);
                return res.status(500).send(internalServerError);
              } else {
                res.status(200).send(responseWrapper(null, 'Berhasil menambahkan sub service', 200));
              }
            });
        }
      } catch (error) {
        unlinkSync(`${imgPath + req.file.filename}`);
        const message = ErrorMessage.getErrorMessage(error);
        if (message) res.status(400).send(responseWrapper(400, message, 400));
        else res.status(500).send(internalServerError);
      }
    } else {
      res.status(400).send(responseWrapper(null, 'Banner harus diupload', 400));
    }
  }

  async updateSubServices(req: Request, res: Response): Promise<void> {
    let services: ISubServices | null;
    let imgLink: string;
    const { id, id_sub } = req.params;
    try {
      services = await Services.findOne({ _id: id }, 'subServices -_id');
      if (!services) {
        throw new Error('Data tidak ditemukan');
      } else {
        const subServices: SubServices = JSON.parse(req.body.data);
        if (req.file) subServices.banner = `${baseUrl + imgPath + req.file.filename}`;
        const data: Array<SubServices> = JSON.parse(JSON.stringify(services.subServices));
        const idx = data.findIndex(({ _id }) => _id === id_sub);
        if (idx > -1) {
          imgLink = data[idx].banner.split('/')[6];
          data[idx] = { ...data[idx], ...subServices };
          Services.updateOne({ _id: id }, { subServices: data })
            .exec((err) => {
              if (err) {
                if (req.file) unlinkSync(`${imgPath + req.file.filename}`);
                return res.status(500).send(internalServerError);
              } else {
                if (req.file) unlinkSync(`${imgPath + imgLink}`);
                res.status(200).send(responseWrapper(null, 'Berhasil mengupdate sub service', 200));
              }
            });
        } else throw new Error('Sub service tidak ditemukan');
      }
    } catch (error) {
      if (req.file) unlinkSync(`${imgPath + req.file.filename}`);
      const message = ErrorMessage.getErrorMessage(error);
      if (message) res.status(400).send(responseWrapper(400, message, 400));
      else res.status(500).send(internalServerError);
    }
  }

  async deleteSubServices(req: Request, res: Response): Promise<void> {
    let subServices: Array<SubServices>;
    let services: ISubServices | null;
    let imgLink: string;
    const { id, id_sub } = req.params;
    try {
      services = await Services.findOne({ _id: id }, 'subServices -_id');
      if (!services) {
        throw new Error('Data tidak ditemukan');
      } else {
        subServices = JSON.parse(JSON.stringify(services.subServices));
        const idx = subServices.findIndex(({ _id }) => _id === id_sub);
        if (idx > -1) {
          imgLink = subServices[idx].banner.split('/')[6];
          subServices.splice(idx, 1);
        } else throw new Error('Sub service tidak ditemukan');
        Services.updateOne({ _id: id }, { subServices })
          .exec((err) => {
            if (err) {
              res.status(500).send(internalServerError);
            } else {
              unlinkSync(`${imgPath + imgLink}`);
              res.status(200).send(responseWrapper(null, 'Berhasil menghapus sub service', 200));
            }
          });
      }
    } catch (error) {
      const message = ErrorMessage.getErrorMessage(error);
      if (message) res.status(400).send(responseWrapper(400, message, 400));
      else res.status(500).send(internalServerError);
    }
  }

  async getServices(req: Request, res: Response): Promise<void> {
    const { lat, long } = req.params;
    const data: Array<IServices> = [];
    const services: Array<IServices> = await Services.find()
      .populate('promo', '-_id diskon end')
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
            status: item.laundry.status,
            diskon: item.promo && new Date().getTime() < new Date(item.promo.end).getTime()
              ? item.promo.diskon : null
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
    const { lat, long } = req.body;
    Services.findOne({ _id: id }, '-__v -ratings')
      .populate('promo', '-_id diskon start end minOrder')
      .populate({
        path: 'laundry',
        select: '-createdAt -updatedAt -__v',
        populate: {
          path: 'user_id',
          select: '-password -createdAt -updatedAt -__v -role',
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }).exec((err, result: any) => {
        if (err) return res.status(500).send(internalServerError);
        if (result) {
          Ratings.find({ id_service: id }, '-_id -__v').exec((err, ratings) => {
            if (err) return res.status(500).send(internalServerError);
            const data: IServices = JSON.parse(JSON.stringify(result));
            const lat2 = data.laundry.user_id.address.lat;
            const long2 = data.laundry.user_id.address.long;
            const distance = new Distance(Number(lat), Number(long), lat2, long2).getDistance();
            let totalRating = 0;
            ratings.forEach(item => ( totalRating += Number(item.rating) ));
            const ratingAverage = !isNaN(Number((totalRating/ratings.length).toFixed(1)))
              ? (totalRating/ratings.length).toFixed(1) : null;
            if (result.promo && new Date().getTime() > new Date(result.promo.end).getTime()){
              data.promo = null;
            }
            return res.status(200).send(responseWrapper(
              {...data, distance, ratingAverage}, 'Success get service', 200));
          });
        }
        else res.status(400).send(responseWrapper(null, 'Data tidak ditemukan', 400));
      });
  }

  getServiceByLaundry(req: Request, res: Response): void {
    const { idLaundry } = req.params;
    Services.find({ laundry: idLaundry }, '-_v')
      .populate('promo', 'name')
      .exec(async (err, results) => {
        if (err) return res.status(500).send(internalServerError);
        if (results) {
          let ratings;
          const data = JSON.parse(JSON.stringify(results));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dataMerge = await Promise.all(data.map(async (item: any) => {
            try {
              ratings = await Ratings.find({ id_service: item._id }, '-_id -__v');
              let totalRating = 0;
              ratings.forEach(item => ( totalRating += Number(item.rating) ));
              const ratingAverage = (totalRating/ratings.length).toFixed(1);
              return {...item, ratingAverage};
            } catch (error) {
              const message = ErrorMessage.getErrorMessage(error);
              if (message) res.status(400).send(responseWrapper(400, message, 400));
              else res.status(500).send(internalServerError);
            }
          }));
          if (dataMerge.length) return res.status(200).send(responseWrapper(dataMerge, 'Success', 200));
        }
        res.status(400).send(responseWrapper(null, 'Data tidak ditemukan', 400));
      });
  }

  update(req: Request, res: Response): void {
    const { id } = req.params;
    const { name, desc, price, quantityType, subServices, laundry, banner } = JSON.parse(req.body.data);
    let Banner: Array<string> = [];
    if (banner && banner.length) Banner = [...banner];
    if (req.files?.length) {
      for (let i = 0; i < req.files.length; i++) {
        Banner.push(`${baseUrl + imgPath + (req.files as Array<File>)[i].filename}`);
      }
    }
    const serviceInput: ServicesInput = {
      name, desc, banner: Banner, price, quantityType, subServices, laundry
    };
    const services = new Services(serviceInput);
    const error = services.validateSync();
    const errMessage = new ValidationException().validate(error, '-laundry^required');

    if (errMessage) {
      if (req.files?.length) {
        for (let i = 0; i < req.files.length; i++) {
          unlinkSync(`${imgPath + (req.files as Array<File>)[i].filename}`);
        }
      }
      res.status(400).send(responseWrapper(null, errMessage, 400));
    }
    else Services.findOneAndUpdate({ _id: id }, serviceInput).exec((err, result) => {
      if (err || !result) {
        if (req.files?.length) {
          for (let i = 0; i < req.files.length; i++) {
            unlinkSync(`${imgPath + (req.files as Array<File>)[i].filename}`);
          }
        }
        if (!result) return res.status(400).send(responseWrapper(null,
          `Service dengan id ${id}, tidak ditemukan atau tidak valid`, 400));
        return res.status(500).send(internalServerError);
      }
      result.banner?.forEach(item => {
        const idx = Banner.findIndex(v => v === item);
        if (idx < 0) unlinkSync(`${imgPath + item.split('/')[6]}`);
      });
      res.status(200).send(responseWrapper(null, 'Berhasil memperbarui service', 200));
    });
  }

  addPromo(req: Request, res: Response): void {
    const { promo } = req.body;
    const { id } = req.params;
    if (!promo) res.status(400).send(responseWrapper(null, 'Promo harus diisi', 400));
    else Services.findOneAndUpdate({ _id: id }, { promo }).exec((err, result) => {
      if (err) return res.status(500).send(internalServerError);
      if (!result) return res.status(400).send(responseWrapper(null,
        `Data dengan id ${id}, tidak ditemukan atau tidak valid`, 400));
      res.status(200).send(responseWrapper(null, 'Berhasil menambahkan promo', 200));
    });
  }

  async addRating(req: Request, res: Response): Promise<void> {
    const { name, rating, comment, id_service, sub_service, order_id } = req.body;
    const ratingInput: RatingInput = { name, rating, comment, id_service, sub_service };
    const newRating = new Ratings(ratingInput);
    const error = newRating.validateSync();

    if (error) new ValidationException().validationError(error, res);
    else {
      Order.updateOne({ _id: order_id }, {isReviewed: true}, {}, (err) => {
        if (err) return res.status(500).send(internalServerError);
        newRating.save((err) => {
          if (err) return res.status(500).send(internalServerError);
          res.status(200).send(responseWrapper(200, 'Berhasil menambahkan rating', 200));
        });
      });
    }
  }

  getRating(req: Request, res: Response): void {
    const { id } = req.params;
    Ratings.find({ id_service: id }, '-_id -__v')
      .populate('id_service','name')
      .exec((err, ratings) => {
        if (err) return res.status(500).send(internalServerError);
        res.status(200).send(responseWrapper(ratings, 'Berhasil mendapatkan rating', 200));
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
        result.banner?.forEach(item => unlinkSync(`${imgPath + item.split('/')[6]}`));
        res.status(200).send(responseWrapper(null, 'Berhasil menghapus service', 200));
      }
    });
  }

}

export default new ServicesController();
