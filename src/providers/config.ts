import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {TranslateProvider} from "./translate";
import { Events } from 'ionic-angular';

@Injectable()
export class ConfigProvider {
  data: any = {
    'contact_mail': '',
    'endpoint': {
      'data': '',
      'assets': ''
    },
    'map': {
      'tileLayer': ''
    }
  };

  /**
   * Paramètres de l'application
   * @type {{language: string; fontSize: string; theme: string}}
   *
   * @var parameters.language - Peut contenir une des valeurs de availableLanguage
   * Langage de l'application.
   *
   * @var parameters.fontSize - Peut être 0 inclus à 8 inclus.
   * Il s'agit de la taille de la police d'écriture.
   *
   * @var parameters.theme - Peut contenir une des valeurs de availableTheme.
   * Affichage du thème jour ou nuit.
   */
  parameters = {
    language: 'fr',
    fontSize: '4',
    theme: 'day',
    menuState: false
  };

  updateMenuState(nextState: boolean) {
    this.parameters.menuState = nextState;
  }

  getMenuState(): boolean {
    return this.parameters.menuState;
  }


  get language(): boolean {
    return this.listenerLanguage();
  }

  set language(nextLg: boolean) {
    if (nextLg) {
      this.updateLanguage('en');
    } else {
      this.updateLanguage('fr');
    }
  }

  /**
   * Définition de la liste des langues disponible.
   *
   * @type {[string , string]}
   */
  availableLanguage: Array<string> = ['fr', 'en'];

  /**
   * Définition de la liste des thèmes disponible.
   * @type {[string , string]}
   */
  availableTheme: Array<string> = ['day', 'night'];

  /**
   * Constructeur.
   *
   * @param {HttpClient} http
   * @param {TranslateProvider} _translate
   */
  constructor(public http: HttpClient,
              public translate: TranslateProvider,
              public events: Events) {
  }

  /**
   *
   * @returns {Promise<T>}
   */
  loadConfiguration () {
    return new Promise((resolve, reject) => {
      return this.http.get('manifest.json').subscribe((resp: any) => {
        this.data = resp.configuration;

        resolve(true);
      }, (err: any) => {
        reject(false);
      });
    });
  }

  /**
   * Mise à jour de la langue de l'application.
   *
   * @param {string} nextValue - Définition d'une des langues disponible.
   */
  updateLanguage(nextValue: string = '') {
    if (nextValue === '') {
      this.parameters.language = this.parameters.language === 'fr' ? 'en' : 'fr';

      this.translate.setLanguage(this.parameters.language);
      this.events.publish('config:updateLanguage');

    } else if (this.availableLanguage.indexOf(nextValue) !== -1) {
      this.parameters.language = nextValue;

      this.translate.setLanguage(this.parameters.language);
      this.events.publish('config:updateLanguage');
    }
  }

  /**
   * Mise à jour du thème de l'application.
   *
   * @param {string} nextValue - Définition d'un des thèmes disponible.
   */
  updateTheme(nextValue: string = '') {
    if (nextValue === '') {
      this.parameters.theme = this.parameters.theme === 'day' ? 'night' : 'day';
      localStorage.setItem('config::theme', this.parameters.theme);
    } else if (this.availableTheme.indexOf(nextValue) !== -1) {
      this.parameters.theme = nextValue;
      localStorage.setItem('config::theme', this.parameters.theme);
    }
  }

  /**
   * Mise à jour de la police d'écriture.
   *
   * @param {string} nextValue - Définition de taille de la police d'écriture.
   */
  updateFontSize(nextValue: string = '') {
    if (nextValue === '') {
      localStorage.setItem('config::fontSize', this.parameters.fontSize);
    } else if (parseInt(nextValue) >= 0 && parseInt(nextValue) <= 8) {
      this.parameters.fontSize = nextValue;
      localStorage.setItem('config::fontSize', this.parameters.fontSize);
    }
  }

  /**
   * Cette méthode retourne une valeur boolean du language de l'application
   * pour une utilisation dans un context de bouton toggle.
   *
   * @returns {boolean}
   */
  listenerLanguage() {
    return this.parameters.language !== 'fr';
  }

  /**
   * Cette méthode retourne une valeur boolean du thème de l'application.
   * pour une utilisation dans un context de bouton toggle.
   *
   * @returns {boolean}
   */
  listenerTheme() {
    return this.parameters.theme !== 'day';
  }

  /**
   * Getter de la langue.
   *
   * @returns {string}
   */
  getLanguage() {
    return this.parameters.language;
  }

  /**
   * Getter du thème.
   *
   * @returns {string}
   */
  getTheme() {
    return this.parameters.theme
  }

  /**
   * Getter de la taille de police d'écriture.
   *
   * @returns {string}
   */
  getFontSize() {
    return 'fontSize' + this.parameters.fontSize;
  }

  /**
   * Forme une chaîne de caractère contenant les styles css
   * du thème courant et de la taille de police d'écriture.
   *
   * @returns {string}
   */
  globalGlobalCss() {
    return this.getTheme() + ' ' + this.getFontSize();
  }

  /**
   * Initialisation des valuers stockées dans le local storage du téléphone de l'utilisateur.
   * Si ces valeurs sont définis. Sinon on défini ceux par défaut.
   */
  async initialize() {
    let _language = await localStorage.getItem('config::langue');
    let _fontSize = await localStorage.getItem('config::fontSize');
    let _theme = await localStorage.getItem('config::theme');

    this.updateLanguage(_language === null ? this.parameters.language : _language);
    this.updateFontSize(_fontSize === null ? this.parameters.fontSize : _fontSize);
    this.updateTheme(_theme === null ? this.parameters.theme : _theme);
  }
}
