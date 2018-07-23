import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class DataProvider {

  bbCodeToHtml = (t: string) => {
    // Fontions internes.
    const deblaie = (reg,t) => {
      let texte = new String(t);
      return texte.replace(reg,'$1\n');
    };
    const remblaie = (t) => {
      let texte = new String(t);
      return texte.replace(/\n/g,'');
    };
    const remplace_tag = (reg,rep,t) => {
      let texte = new String(t);
      return texte.replace(reg,rep);
    };

    // Process.
    // B
    t = deblaie(/(\[\/b\])/g,t);
    t = remplace_tag(/\[b\](.+)\[\/b\]/g,'<b>$1</b>',t);
    t = remblaie(t);
    // I
    t = deblaie(/(\[\/i\])/g,t);
    t = remplace_tag(/\[i\](.+)\[\/i\]/g,'<i>$1</i>',t);
    t = remblaie(t);
    // U
    t = deblaie(/(\[\/u\])/g,t);
    t = remplace_tag(/\[u\](.+)\[\/u\]/g,'<u>$1</u>',t);
    t = remblaie(t);

    // Return résultat.
    return t;
  };

}
