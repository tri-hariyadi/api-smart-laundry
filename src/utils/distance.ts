class Distance {
  private lat1;
  private lon1;
  private lat2;
  private lon2;

  constructor(lat1: number, lon1: number, lat2: number, lon2: number) {
    this.lat1 = lat1;
    this.lon1 = lon1;
    this.lat2 = lat2;
    this.lon2 = lon2;
  }

  protected toRad(Value: number): number {
    return Value * Math.PI / 180;
  }

  public getDistance(): number {
    const R = 6371; // km
    const dLat = this.toRad(this.lat2 - this.lat1);
    const dLon = this.toRad(this.lon2 - this.lon1);
    const latFirst = this.toRad(this.lat1);
    const latSecond = this.toRad(this.lat2);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(latFirst) * Math.cos(latSecond);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return Number(d.toFixed(1));
  }
}

export default Distance;
