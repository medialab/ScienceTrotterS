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


const deblaie = (reg,t) => {
  let texte = new String(t);
  return texte.replace(reg,'$1\n');
};

const remblaie = (t) => {
  let texte = new String(t);
  return texte.replace(/\n/g,'');
};

const remplaceTag = (reg,rep,t) => {
  let texte = new String(t);
  return texte.replace(reg,rep);
};

export const bbCodeToHtml = (t: string) => {
  // Process.
  // [B]*[/B]
  t = deblaie(/(\[\/b\])/g,t);
  t = remplaceTag(/\[b\](.+)\[\/b\]/g,'<b>$1</b>',t);
  t = remblaie(t);
  // [I]*[/]
  t = deblaie(/(\[\/i\])/g,t);
  t = remplaceTag(/\[i\](.+)\[\/i\]/g,'<i>$1</i>',t);
  t = remblaie(t);
  // [U]*[/U]
  t = deblaie(/(\[\/u\])/g,t);
  t = remplaceTag(/\[u\](.+)\[\/u\]/g,'<u>$1</u>',t);
  t = remblaie(t);
  // Handle quotes
  t = remplaceTag(/«(.+)»/g,'<q>$1</q>',t);
  t = remblaie(t);

  const replaceKeyBR = /\[br\]/g;
  const replaceValueBR = '<br />';
  t = t.replace(replaceKeyBR, replaceValueBR);

  // Return result.
  return t;
};