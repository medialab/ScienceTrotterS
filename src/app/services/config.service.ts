import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
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
    theme: 'day'
  };
  constructor() {
    this.initialize();
  }

  /**
   * Initialisation des valuers stockées dans le local storage du téléphone de l'utilisateur.
   * Si ces valeurs sont définis. Sinon on défini ceux par défaut.
   */
  initialize() {
    // let _language = await localStorage.getItem('config::langue');
    let _fontSize = localStorage.getItem('config::fontSize');
    // let _theme = await localStorage.getItem('config::theme');

    // this.updateLanguage(_language === null ? this.parameters.language : _language);
    this.updateFontSize(_fontSize === null ? this.parameters.fontSize : _fontSize);
    // this.updateTheme(_theme === null ? this.parameters.theme : _theme);
  }


  /**
   * Getter de la taille de police d'écriture.
   *
   * @returns {string}
   */
  getFontSizeClass() {
    return 'fontSize' + this.parameters.fontSize;
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
}
