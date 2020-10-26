import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  /**
   * Paramètres de l'application
   * @type {{fontSize: string; theme: string}}
   *
   * @var parameters.fontSize - Peut être 0 inclus à 8 inclus.
   * Il s'agit de la taille de la police d'écriture.
   *
   * @var parameters.theme - Peut contenir une des valeurs de availableTheme.
   * Affichage du thème jour ou nuit.
   */
  parameters = {
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
    const fontSize = localStorage.getItem('config::fontSize');
    // let _theme = await localStorage.getItem('config::theme');
    // this.updateLanguage(_language === null ? this.parameters.language : _language);
    this.updateConfig('config::fontSize', fontSize ? this.parameters.fontSize : fontSize);
    this.parameters.fontSize = fontSize;
    // this.updateTheme(_theme === null ? this.parameters.theme : _theme);
  }

  updateFontSize(nextValue: string = '') {
    if(nextValue !== '') {
      this.parameters.fontSize = nextValue;
      this.updateConfig('config::fontSize', nextValue);
    }
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
  updateConfig(key: string, nextValue: string) {
    localStorage.setItem(key, nextValue);
  }
}
