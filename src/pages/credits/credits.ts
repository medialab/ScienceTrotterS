import { Component } from '@angular/core';
import {Events, IonicPage, NavController, NavParams} from 'ionic-angular';
import {TranslateProvider} from "../../providers/translate";
import {ApiProvider} from "../../providers/api";
import {ConfigProvider} from "../../providers/config";

@IonicPage()
@Component({
  selector: 'page-credits',
  templateUrl: 'credits.html',
})
export class CreditsPage {

  isActivePage: boolean = false;
  isOnUpdateLanguage: boolean = false;

  content: string = '';
  apiData: any;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public api: ApiProvider,
              public config: ConfigProvider,
              public translate: TranslateProvider) {

    this.init();
  }

  init() {
    this.loadCreditsFromApi();
  }

  loadCreditsFromApi() {
    this.api.get('/public/credits/latest').subscribe((onSuccess) => {
      this.apiData = onSuccess.data;
      this.content = onSuccess.data.content[this.config.getLanguage()];

      console.log('content', this.content);
    }, (onError) => {
      console.log('onError');
    });
  }
}
