import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {TranslateProvider} from "../../providers/translate";

@IonicPage()
@Component({
  selector: 'page-credits',
  templateUrl: 'credits.html',
})
export class CreditsPage {
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public translate: TranslateProvider) {
  }
}
