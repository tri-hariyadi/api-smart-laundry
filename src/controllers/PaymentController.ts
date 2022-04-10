import crypto from 'crypto';
import { Request, Response } from 'express';
import IPaymentController from '../interfaces/controller.payment.interface';
import BCA from '../utils/bca';
import responseWrapp, { internalServerError } from '../utils/responseWrapper';
import ErrorMessage from '../utils/errorMessage';

class PaymentController implements IPaymentController {
  bcaPayout(req: Request, res: Response): void {
    const payload = req.body;
    payload.TransactionID = String(crypto.randomInt(0, 99999999));
    payload.ReferenceID = `${String(crypto.randomInt(0, 99999))}/po/${new Date().getFullYear()}`;
    BCA.service({ method: 'post', url: 'banking/corporates/transfers', data: payload })
      .then((response) => {
        if (response.data && response.status === 200)
          return res.status(200).send(responseWrapp(response.data, 'Succeeded', 200));
        throw new Error(response.data.ErrorMessage.Indonesian);
      })
      .catch((err) => {
        const message = ErrorMessage.getErrorMessage(err);
        if (message) res.status(400).send(responseWrapp(400, message, 400));
        else res.status(500).send(internalServerError);
      });
  }

  bcaMutationAccount(req: Request, res: Response): void {
    const { CorporateID, SourceAccountNumber } = req.body;
    BCA.service({ method: 'get', url: `banking/v3/corporates/${CorporateID}/accounts/${SourceAccountNumber}` })
      .then(response => {
        if (response.data)
          return res.status(200).send(responseWrapp(response.data, 'Succeeded', 200));
        throw new Error('Failed Mutation');
      })
      .catch(err => {
        // console.log(err);
        const message = ErrorMessage.getErrorMessage(err);
        if (message) res.status(400).send(responseWrapp(400, message, 400));
        else res.status(500).send(internalServerError);
      });
  }

}

export default new PaymentController();
