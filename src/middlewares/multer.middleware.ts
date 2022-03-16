import path from 'path';
import { Request } from 'express';
import multer, { StorageEngine, FileFilterCallback } from 'multer';

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

class UploadPhoto {
  private storage: StorageEngine;

  constructor() {
    this.storage = this.initializeStorage();
  }

  private initializeStorage() {
    return multer.diskStorage({
      destination: (req: Request, file: Express.Multer.File, cb: DestinationCallback) => {
        cb(null, 'public/images');
      },
      filename: (req: Request, file: Express.Multer.File, cb: FileNameCallback) => {
        cb(null, Date.now() + path.extname(file.originalname));
      },
    });
  }

  private checkFileType(file: Express.Multer.File, cb: FileFilterCallback) {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if (mimeType && extName) {
      return cb(null, true);
    } else {
      cb(null, false);
    }
  }

  public uploadSingle() {
    return multer({
      storage: this.storage,
      // limits: { fileSize: 1000000 },
      fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        this.checkFileType(file, cb);
      }
    }).single('image');
  }

  public uploadMultiple() {
    return multer({
      storage: this.storage,
      // limits: { fileSize: 1000000 },
      fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        this.checkFileType(file, cb);
      }
    }).array('image');
  }

}

export default new UploadPhoto();
