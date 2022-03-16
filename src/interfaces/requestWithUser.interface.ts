import { Request } from 'express';
import { UserDocument } from '../models/UserModel';

interface RequestWithUser extends Request {
  user: UserDocument;
}

export default RequestWithUser;
