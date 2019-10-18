import { Component } from '@angular/core';
import {Events, NavController, Platform} from 'ionic-angular';
import {TranslateProvider} from "../../providers/translate";
import {ConfigProvider} from "../../providers/config";
import {ApiProvider} from "../../providers/api";
import {City} from "../../models/City";
import {DataProvider} from "../../providers/data";
import {AlertProvider} from "../../providers/alert";
import { DomSanitizer } from '@angular/platform-browser';

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

  /**
   *
   * @param city
   */
  openParcoursList(event: any, city: any) {
    event.preventDefault();

    this.navCtrl.push('PreviewByCity', {
      'city': city,
      'uuid': city.id
    });
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
