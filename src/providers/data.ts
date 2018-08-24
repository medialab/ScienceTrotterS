import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class DataProvider {
  deblaie = (reg,t) => {
    let texte = new String(t);
    return texte.replace(reg,'$1\n');
  };

  remblaie = (t) => {
    let texte = new String(t);
    return texte.replace(/\n/g,'');
  };

  remplaceTag = (reg,rep,t) => {
    let texte = new String(t);
    return texte.replace(reg,rep);
  };

  bbCodeToHtml = (t: string) => {
    // Process.
    // [B]*[/B]
    t = this.deblaie(/(\[\/b\])/g,t);
    t = this.remplaceTag(/\[b\](.+)\[\/b\]/g,'<b>$1</b>',t);
    t = this.remblaie(t);
    // [I]*[/]
    t = this.deblaie(/(\[\/i\])/g,t);
    t = this.remplaceTag(/\[i\](.+)\[\/i\]/g,'<i>$1</i>',t);
    t = this.remblaie(t);
    // [U]*[/U]
    t = this.deblaie(/(\[\/u\])/g,t);
    t = this.remplaceTag(/\[u\](.+)\[\/u\]/g,'<u>$1</u>',t);
    t = this.remblaie(t);
    // Return result.
    return t;
  };

  bbCodeToMail = (t: string) => {
    // Process.
    // [B]*[/B]
    t = this.deblaie(/(\[\/b\])/g,t);
    t = this.remplaceTag(/\[b\](.+)\[\/b\]/g,'$1',t);
    t = this.remblaie(t);
    // [I]*[/]
    t = this.deblaie(/(\[\/i\])/g,t);
    t = this.remplaceTag(/\[i\](.+)\[\/i\]/g,'$1',t);
    t = this.remblaie(t);
    // [U]*[/U]
    t = this.deblaie(/(\[\/u\])/g,t);
    t = this.remplaceTag(/\[u\](.+)\[\/u\]/g,'$1',t);
    t = this.remblaie(t);
    // Return result.
    return t;
  };

  /**
   * Envoi d'un mail via l'application de messagerie de
   * l'utilisateur.
   * @param to - destinaire
   * @param subject - object
   * @param body - contenu
   * @returns {Window}
   */
  sendEmail = (to: string = '', subject: string = '', body: string = '') => {
    body = this.bbCodeMailJumpLine(body);
    const tmpMail = window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_system', 'location=no');

    return tmpMail;
  };

  bbCodeMailJumpLine = (str: string) => {
    const replaceKey = /\[jumpLine\]/g;
    const replaceValue = '%0D%0A';
    return str.replace(replaceKey, replaceValue);
  };
}
