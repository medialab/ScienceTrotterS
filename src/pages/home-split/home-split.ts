import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {TranslateProvider} from "../../providers/translate";

/**
 * Generated class for the HomeSplitPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-home-split',
  templateUrl: 'home-split.html',
})
export class HomeSplitPage {

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public translate: TranslateProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomeSplitPage');
  }

}
