import {Component, ViewChild} from '@angular/core';
import {MenuController, Nav, Platform} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { HomePage } from '../pages/home/home';
import {TranslateProvider} from "../providers/translate";
import {ConfigProvider} from "../providers/config";
import {ApiProvider} from "../providers/api";

@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  /**
   * Page par défaut qui va être chargée lors de l'ouverture.
   *
   * @type {HomePage} - Page.
   */
  rootPage:any;

  /**
   * Context de navigation.
   */
  @ViewChild(Nav) nav;

  constructor(platform: Platform,
              statusBar: StatusBar,
              splashScreen: SplashScreen,
              public menuCtrl: MenuController,
              public config: ConfigProvider,
              public translate: TranslateProvider,
              public api: ApiProvider,
              private camera: Camera) {

    /**
     * Initialisation de l'application.
     */
    platform.ready().then(() => {
      config.initialize();

      api.loadApiUrl().then(res => {
        this.rootPage = HomePage;
        this.nav.setRoot(HomePage);
      }).catch(err => {
        splashScreen.hide();
        this.rootPage = HomePage;
        this.nav.setRoot(HomePage);
      })

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

  openCamera() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      saveToPhotoAlbum: true,
      cameraDirection: this.camera.Direction.BACK
    };
    this.camera.getPicture(options);
  }

  menuHandler (state: any, target: string) {
    /**
    if (typeof state === 'boolean') {
      document
        .querySelector('#menuGlobal')
        .setAttribute('aria-expanded', target === 'open' ? true : false);
    }
    */
  }
}
