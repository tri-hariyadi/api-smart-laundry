import { Request, Response } from 'express';
import responseWrapper from '../utils/responseWrapper';

class LocationController {
  index(req: Request, res: Response): Response {
    function calcCrow(lat1: number, lon1: number, lat2: number, lon2: number): number {
      const R = 6371; // km
      const dLat = toRad(lat2-lat1);
      const dLon = toRad(lon2-lon1);
      const latFirst = toRad(lat1);
      const latSecond = toRad(lat2);

      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(latFirst) * Math.cos(latSecond);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const d = R * c;
      return d;
    }

    // Converts numeric degrees to radians
    function toRad(Value: number): number {
      return Value * Math.PI / 180;
    }
    const distance = calcCrow(59.3293371,13.4877472,59.3225525,13.4619422).toFixed(1);
    return res.status(200).send(responseWrapper(distance, 'Successfully get distance', 200));
  }
}

export default new LocationController();
