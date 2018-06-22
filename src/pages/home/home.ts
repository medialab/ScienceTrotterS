import { Component } from '@angular/core';
import {NavController, Platform} from 'ionic-angular';
import {TranslateProvider} from "../../providers/translate";
import {ConfigProvider} from "../../providers/config";
import {ApiProvider} from "../../providers/api";
import {City} from "../../models/City";
import {DataProvider} from "../../providers/data";

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
              public api: ApiProvider) {

    this._init();
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
    const target = '/public/cities/list';
    let req = this.api.get(target).subscribe((resp: any) => {
      console.log('result', resp);

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
