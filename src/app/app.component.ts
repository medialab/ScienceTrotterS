import {Component, ViewChild} from '@angular/core';
import {MenuController, Nav, Platform} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import {TranslateProvider} from "../providers/translate";
import {ConfigProvider} from "../providers/config";

@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  /**
   * Page par défaut qui va être chargée lors de l'ouverture.
   *
   * @type {HomePage} - Page.
   */
  rootPage:any = HomePage;
  /**
   * Context de navigation.
   */
  @ViewChild(Nav) nav;

  constructor(platform: Platform,
              statusBar: StatusBar,
              splashScreen: SplashScreen,
              public menuCtrl: MenuController,
              public config: ConfigProvider,
              public translate: TranslateProvider) {

    /**
     * Initialisation de l'application.
     */
    platform.ready().then(() => {
      statusBar.styleDefault();
      config.initialize();
      setTimeout(() => {
        splashScreen.hide();
      }, 10000);
    });
  }

  /**
   * Au clique d'un lien du menu, une nouvelle page
   * va être ouverte.
   *
   * @param {string} nextPage - Nom d'une page.
   */
  onItemClick(nextPage: string = '') {
    this.menuCtrl.close();

    if (nextPage !== '') {
      this.nav.push(nextPage);
    }
  }
}
