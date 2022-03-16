import { Response } from 'express';
import { Error } from 'mongoose';
import responseWrapper from '../utils/responseWrapper';

class ValidationException {
  validationError(err: Error.ValidationError, res: Response): void {
    if (err) {
      const errors = Object.values(err.errors).map((el) => el.message);
      const code = 400;
      if (errors.length > 1) {
        const formattedErrors = errors.join(', ');
        res.status(code).send(responseWrapper(null, formattedErrors, code));
      } else {
        res.status(code).send(responseWrapper(null, errors[0], code));
      }
    }
  }

  validate(err: Error.ValidationError | null, skipPath: string): string | null {
    if (err) {
      const errors = Object.values(err.errors);
      const arrSkipPath = skipPath.substring(1).split(', -');
      arrSkipPath.forEach(v => {
        for(let i = 0; i < errors.length; i++) {
          if (errors[i].path === this.substringCircum(v)[0]) {
            const errExclude = this.substringCircum(v);
            if (errExclude.length > 1) {
              for(let k = 0; k < errExclude.length; k++) {
                if (errors[i].kind === errExclude[k] && k > 0) {
                  errors.splice( errors.map((e) => e.path).indexOf(this.substringCircum(v)[0]),1);
                  break;
                }
              }
            } else {
              errors.splice( errors.map((e) => e.path).indexOf(this.substringCircum(v)[0]),1);
            }
          }
        }
      });
      const newErrors = errors.map(el => el.message);
      if (newErrors.length > 1) return newErrors.join(', ');
      else if (newErrors.length < 2) return newErrors[0];
      else return null;
    }
    return null;
  }

  private substringCircum(newValue: string): Array<string> {
    if (newValue.includes('^')) return newValue.split('^');
    return [newValue];
  }
}

export default ValidationException;
