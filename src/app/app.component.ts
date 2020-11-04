import { GeolocService } from 'src/app/services/geoloc.service';
import { OfflineStorageService } from './services/offline-storage.service';
import { ConfigService } from './services/config.service';
import { Component } from '@angular/core';

import { Plugins, NetworkStatus, PluginListenerHandle } from '@capacitor/core';

import { Platform, ToastController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {TranslateService} from '@ngx-translate/core';
import { CacheService } from 'ionic-cache';
const { Network } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  networkListener: PluginListenerHandle;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public translate: TranslateService,
    private toastCtrl: ToastController,
    private offlineStorage: OfflineStorageService,
    private cache: CacheService,
    private geoloc: GeolocService,
    public config: ConfigService
  ) {
    // Config translateModule
    translate.addLangs(['en', 'fr'])
    if (localStorage.getItem('config::locale')) {
      const browserLang = localStorage.getItem('config::locale');
      translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
    } else {
      localStorage.setItem('config::locale', 'fr');
      translate.setDefaultLang('fr');
      translate.use('fr');
    }

    this.networkListener = Network.addListener('networkStatusChange', (status) => {
      const connection = status.connected ? 'online' : 'offline'
      this.translate.get('TOAST_MSG_NETWORK', { connection }).subscribe(async (message) => {
        const toast = await this.toastCtrl.create({
          message,
          duration: 3000,
          position: 'bottom'
        });

        toast.present();
      })
    });

    // config cache
    cache.setDefaultTTL(60 * 60 * 24); //set default cache TTL for 1 day

    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
  async openMap() {
    let position = null;
    try {
      position = await this.geoloc.getCurrentCoords();
    } catch (err){
      console.log(err)
    }
    if(position) {
      if(this.platform.is('android')) {
        window.open(`geo:${position.latitude},${position.longitude}?q=${position.latitude},${position.longitude}`);
      }
      if(this.platform.is('ios')) {
        window.open(`http://maps.apple.com/?q:${position.latitude},${position.longitude}`)
      }
    }
  }
}
