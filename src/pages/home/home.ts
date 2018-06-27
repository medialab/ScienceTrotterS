import { Component } from '@angular/core';
import {NavController, Platform} from 'ionic-angular';
import {TranslateProvider} from "../../providers/translate";
import {ConfigProvider} from "../../providers/config";
import {ApiProvider} from "../../providers/api";
import {City} from "../../models/City";
import {DataProvider} from "../../providers/data";
import {AlertProvider} from "../../providers/alert";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  activeLg: string = "activeLg";
  listCities: Array<City> = new Array();
  platformValues: string = '';

  constructor(public dataProvider: DataProvider,
              public navCtrl: NavController,
              public config: ConfigProvider,
              public translate: TranslateProvider,
              public platform: Platform,
              public api: ApiProvider,
              public alert: AlertProvider) {
    this._init();

    console.log('HomePage Constructor');
  }

  ionViewDidLoad () {
    console.log('home controller ionViewDidLoad');
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
  setActiveLanguageClass(targetLg: string) {
    return {
      [this.activeLg]: this.config.getLanguage() === targetLg
    };
  }

  /**
   *
   * @private
   */
  _initCities() {
    this.api.get('/public/cities/list').subscribe((resp: any) => {
      if (resp.success) {
        this.listCities = resp.data.map(city => new City(city));
      }
    });
  }

  /**
   *
   * @param e
   */
  updateLanguage(e) {
    this.config.updateLanguage();
  }

  /**
   *
   * @param city
   */
  openParcoursList(event: any, city: any) {
    event.preventDefault();

    this.navCtrl.push('PreviewByCity', {
      city: city,
      uuid: city.id
    });
  }

  /**
   *
   * @returns {City[]}
   */
  getListCities () {
    return this.listCities.filter((item: City) => {
      return item.force_lang === null || item.force_lang === this.config.getLanguage();
    });
  }
}
