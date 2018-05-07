import {Component, Input} from '@angular/core';
import {TranslateProvider} from "../../providers/translate";
import {NavController} from "ionic-angular";

@Component({
  selector: 'main-header',
  templateUrl: 'main-header.html'
})
export class MainHeaderComponent {

  @Input() withMenu: boolean = false;
  @Input() withBackButton: boolean = false;

  constructor(public navCtrl: NavController,
              public translate: TranslateProvider) {
  }

  goBack() {
    this.navCtrl.pop();
  }
}
