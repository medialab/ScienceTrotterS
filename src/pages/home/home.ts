import { Component } from '@angular/core';
import {NavController, Platform} from 'ionic-angular';
import {TranslateProvider} from "../../providers/translate";
import {ConfigProvider} from "../../providers/config";
import {ApiProvider} from "../../providers/api";
import {City} from "../../models/City";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  activeLg: string = "activeLg";
  listCities: Array<City> = new Array();
  platformValues: string = '';

  constructor(public navCtrl: NavController,
              public config: ConfigProvider,
              public translate: TranslateProvider,
              public platform: Platform,
              public api: ApiProvider) {

    this._init();

    this.platformValues = platform.width() + ' --- ' + platform.height();
  }

  _init() {
    this._initCities();
  }

  setActiveLanguageClass(targetLg: string) {
    return {
      [this.activeLg]: this.config.getLanguage() === targetLg
    };
  }

  _initCities() {
    this.api.get('/public/cities/list').subscribe((resp: any) => {
      if(resp.success) {
        this.listCities = resp.data.map(city => new City(city));
      }
    }, (error: any) => {
      console.log('error : ', error);
    });
  }

  updateLanguage(e) {
    this.config.updateLanguage();
  }

}
