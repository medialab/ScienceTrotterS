import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {TranslateProvider} from "../../providers/translate";

/**
 * Generated class for the ParcoursListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-parcours-list',
  templateUrl: 'parcours-list.html',
})
export class ParcoursListPage {

  contentListClass = {
    contentList: true,
    isOpen: false
  };

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public translate: TranslateProvider) {
  }

  openContentList() {
    this.contentListClass.isOpen = this.contentListClass.isOpen ? false : true;
  }

  currentOpenIcon() {
    return this.contentListClass.isOpen ? 'ios-arrow-down': 'ios-arrow-up';
  }

}
