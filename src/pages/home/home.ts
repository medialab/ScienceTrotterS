import { Component } from '@angular/core';
import {Events, NavController, Platform} from 'ionic-angular';
import {TranslateProvider} from "../../providers/translate";
import {ConfigProvider} from "../../providers/config";
import {ApiProvider} from "../../providers/api";
import {City} from "../../models/City";
import {DataProvider} from "../../providers/data";
import { OfflineStorageProvider } from './../../providers/offlineStorage';
import {AlertProvider} from "../../providers/alert";
import { DomSanitizer } from '@angular/platform-browser';
import { ConnectionStatus, NetworkService } from './../../providers/network';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  activeLg: string = "activeLg";
  listCities: Array<City> = new Array();
  platformValues: string = '';

  audioURI = 'cdvfile://localhost/files/6725fdc7-70b5-4138-91e4-2bcb04c79849.mp3';

  get currentLanguage () {
    return this.config.getLanguage();
  }

  set currentLanguage (nextLg: string) {
    // NONE.
  }

  constructor(public dataProvider: DataProvider,
              public navCtrl: NavController,
              public config: ConfigProvider,
              public events: Events,
              public translate: TranslateProvider,
              public platform: Platform,
              public api: ApiProvider,
              private offlineStorage: OfflineStorageProvider,
              public networkService: NetworkService,
              public alert: AlertProvider) {
    this._init();
    this.events.subscribe('config:updateLanguage', this._init.bind(this));
  }

  /**
   *
   * @private
   */
  _init() {
    this._initCities();
  }

  /**
   *
   * @param targetLg
   * @returns {{}}
   */
  setLgActiveAria(targetLg: string) {
    return this.config.getLanguage() === targetLg;
  }

  /**
   *
   * @private
   */
  _initCities() {
    // Loader au chargement des données.
    let isLoaderVisible = true;
    const loaderContent = '';
    const loader = this.alert.createLoader(loaderContent);

    this.api.get('/public/cities/list?lang=' + this.config.getLanguage()).subscribe((resp: any) => {
      if (resp.success) {
        this.listCities = resp.data;
      }

      if (isLoaderVisible) {
        isLoaderVisible = false;
        loader.dismiss();
      }
    }, (err: any) => {
      if (isLoaderVisible) {
        isLoaderVisible = false;
        loader.dismiss();
      }
    });
  }

  /**
   *
   * @param e
   */
  updateLanguage(nextValue: string = '') {
    this.config.updateLanguage(nextValue);
  }

  isNetworkOff() {
    return this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline ? true : false
  }

  /**
   *
   * @param city
   */
  openParcoursList(event: any, city: any) {
    event.preventDefault();

    if(this.isNetworkOff()) {

      // check if POIs of the city is cached in storage
      const interestsPath = `/public/interests/byCityId/${city.id}?lang=${this.config.getLanguage()}`;
      const url = this.api.getRequestURI(interestsPath);
      this.offlineStorage.getRequest(url).then((res) => {
        if (res) {
          this.navCtrl.push('PreviewByCity', {
            'city': city,
            'uuid': city.id
          });
        } else {
          this.networkService.alertIsNetworkOff()
        }
      }).catch((err) => {
        this.networkService.alertIsNetworkOff()
      })
    } else {
      this.navCtrl.push('PreviewByCity', {
        'city': city,
        'uuid': city.id
      });
    }
  }

  /**
   *
   * @returns {City[]}
   */
  getListCities () {
    return this.listCities.filter((item: any) => {
      return item.force_lang === null || item.force_lang === this.config.getLanguage();
    });
  }

  hiddenSelectLgOnChange (event: any) {
    const selectedItem = event.target[event.target.selectedIndex];

    this.updateLanguage(selectedItem.value);
  }
}
