import HttpException from './HttpException';

class AuthException extends HttpException {
  constructor(message: string) {
    super(401, message);
  }
}

export default AuthException;
