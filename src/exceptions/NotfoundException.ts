import { Request, Response } from 'express';

function NotfoundException(req: Request, res: Response) {
  const status = 404;
  const message = 'Not Found';

  res.status(status).send({
    message,
    status
  });
}

export default NotfoundException;
