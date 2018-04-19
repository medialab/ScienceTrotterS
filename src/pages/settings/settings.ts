import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {TranslateProvider} from "../../providers/translate";
import {ConfigProvider} from "../../providers/config";

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public config: ConfigProvider,
              public translate: TranslateProvider) {

  }

  /**
   * Mise a jour de la langue à la modification de l'état du toggle.
   */
  updateLanguage() {
    this.config.updateLanguage();
  }

  /**
   * Mise a jour de la taille de la police.
   */
  updateFontSize() {
    this.config.updateFontSize();
  }

  /**
   * Mise a jour du thème à la modification de l'état du toggle.
   */
  updateTheme() {
    this.config.updateTheme();
  }
}
