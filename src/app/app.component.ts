import {Component, ElementRef, ViewChild} from '@angular/core';
import {Content, Events, MenuController, Nav, Platform} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { HomePage } from '../pages/home/home';
import {TranslateProvider} from "../providers/translate";
import {ConfigProvider} from "../providers/config";
import {ApiProvider} from "../providers/api";
import { CacheService } from "ionic-cache";
import {Observable} from "rxjs/Observable";
import {PlayerAudioProvider} from "../providers/playerAudio";
import {PreviewByCityPage} from "../pages/preview-by-city/preview-by-city";
import {LoaderPage} from "../pages/loader/loader";

@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  /**
   * Page par défaut qui va être chargée lors de l'ouverture.
   *
   * @type {LoaderPage} - Page.
   */
  rootPage:any = 'LoaderPage';

  @ViewChild('btnClose') btnClose: Content;

  /**
   * Context de navigation.
   */
  @ViewChild(Nav) nav;

  constructor (public playerAudioProvider: PlayerAudioProvider,
               public platform: Platform,
               public statusBar: StatusBar,
               public splashScreen: SplashScreen,
               public menuCtrl: MenuController,
               public config: ConfigProvider,
               public translate: TranslateProvider,
               public cache: CacheService,
               public api: ApiProvider,
               private camera: Camera) {
    /**
     * Initialisation de l'application.
     */
    platform.ready().then(() => {
      this.globalListener();

      splashScreen.hide();
      config.initialize();

      // Set TTL to 12h
      cache.setDefaultTTL(60 * 60 * 12);
      // Keep our cached results when device is offline!
      cache.setOfflineInvalidate(false);

      // Chargement de la configuration.
      config.loadConfiguration().then(() => {
        this.rootPage = HomePage;
      });
    });
  }

  /**
   * Au clique d'un lien du menu, une nouvelle page
   * va être ouverte.
   *
   * @param {string} nextPage - Nom d'une page.
   */
  onItemClick (event: any, nextPage: string = '') {
    event.preventDefault();
    this.menuCtrl.close();

    if (nextPage !== '') {
      this.nav.push(nextPage);
    }
  }

  /**
   * Cette méthode ouvre la caméra de l'appareil
   * et donne la possibilité de prendre une photo qui sera
   * enregistré dans la galerie photo de l'appareil.
   * Une option retour donne la possibilité de revenir vers
   * l'application.
   */
  openCamera () {
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

  /**
   *
   * @param state
   * @param target
   */
  menuHandler (state: any, target: string) {
    const focusHandler = () => {
      setTimeout(() => {
        this.btnClose._elementRef.nativeElement.focus();
      }, 0);
    };

    if (typeof state === 'boolean') {
      switch (target) {
        case 'open':
          this.config.updateMenuState(true);
          focusHandler();
          break;
        case 'close':
          this.config.updateMenuState(false);
          break;
      }
    }
  }

  /**
   * TODO : sendCurrentPosition()
   */
  sendCurrentPosition () {
    console.log('sendCurrentPosition');
  }

  /**
   * Global listener pour lors du switch d'une page.
   */
  globalListener () {
    const events = Observable.merge(
      this.nav.viewWillLeave,
      this.nav.viewWillEnter
    );

    events.subscribe(() => {
      this.playerAudioProvider.isPlayingAndStopThem();
    });
  }

}
