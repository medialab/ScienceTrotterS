import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Injectable()
export class TranslateProvider {
  /**
   * Langue courante.
   */
  currentLanguage: string;
  /**
   * Langue par défaut.
   * @type {string}
   */
  defaultLanguage: string = 'fr';
  /**
   * Définition de la liste des langues disponible.
   *
   * @type {[string , string]}
   */
  availableLanguage: Array<string> = ['fr', 'en'];
  /**
   * Tableau d'objet des valeurs des textes.
   */
  data: object;

  constructor (public http: HttpClient,
              private _translate: TranslateService) {
  }

  /**
   * Définition de la langue courante.
   * @param {string} lg
   */
  setCurrentLanguage (lg: string) {
    this.currentLanguage = lg;
  }

  /**
   * Définition du tableau d'objet des valeurs des textes.
   *
   * @param {Object} obj
   */
  setData (obj: object) {
    this.data = obj;
  }

  /**
   * Récupèration d'une valeur traduire grâce à la clé approprié.
   *
   * @param {string} key
   * @returns {string}
   */
  getKey (key: string) {
    if (typeof this.data === 'undefined') {
      return key;
    } else {
      return typeof this.data[key] === 'undefined' ? key : this.data[key];
    }
  }

  /**
   * Définition de la langue courante.
   *
   * @param {string} nextLanguage
   */
  setLanguage (nextLanguage: string = '') {
    let _findLanguage: string = nextLanguage === ''
      ? this._translate.getBrowserLang()
      : nextLanguage;

    if (this.availableLanguage.indexOf(_findLanguage) == -1) {
      _findLanguage = this.defaultLanguage;
    }

    this._translate.getTranslation(_findLanguage).subscribe(obj => {
      this.setCurrentLanguage(_findLanguage);
      this.setData(obj);

      document.querySelector('html').lang = _findLanguage;
      localStorage.setItem('config::langue', _findLanguage);
      localStorage.setItem('translate:data', JSON.stringify(obj));
    }, err => {
      // ==> Handle language file not found.
      console.log('error translate file');
    });
  }

  fromApi (lg: string, key: any) {
    const undefinedValue = '';

    if (typeof key === 'undefined' || typeof key[lg] === 'undefined') {
      return undefinedValue;
    } else {
      return key[lg];
    }
  }
}
