  /**
   *
   * @param str
   * @returns {string}
   */
  export const minifyString = (str: string) => {
  let _str = str;

  try {
    _str = (str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase());
  } catch (e) {

  }

  return _str;
}


  // TODO: enable geoloc
  export const getDistance = (start, end) => {
    const rayon = 6378137;
    const toRadians = Math.PI / 180;
    let dist = 0;

    const a = (start.latitude * toRadians);
    const b = (start.longitude * toRadians);
    const c = (end.latitude * toRadians);
    const d = (end.longitude * toRadians);
    const e = Math.asin(Math.sqrt(Math.pow(Math.sin((a - c) / 2), 2) + Math.cos(a) * Math.cos(c) * Math.pow(Math.sin((b - d) / 2), 2)));
    dist = e * rayon * 2;

    return {
      'distance': convertMeterToDistance(dist),
      'time': convertMeterToTime(dist)
    };
  };

  const convertMeterToDistance = (meter) => {
    if (meter < 1000) {
      return meter.toFixed(0) + 'm';
    } else {
      const toKM = meter / 1000;
      return toKM.toFixed(0) + 'km';
    }
  };

  /**
  * La durée est calculée par : 1mètre = 1minute
  * @param meter
  */
  const convertMeterToTime = (meter) => {
    meter = meter.toFixed(0);
    const meterToMinute = meter / 100;

    if (meterToMinute < 60) {
      return meterToMinute.toFixed(0) + 'm';
    } else {
      const meterToKM = meterToMinute / 60;

      return meterToKM.toFixed(0) + 'h';
    }
  };
