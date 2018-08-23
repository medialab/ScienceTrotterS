import {Component, Input} from '@angular/core';
import {TranslateProvider} from "../../providers/translate";
import {NavController} from "ionic-angular";
import {ConfigProvider} from "../../providers/config";

@Component({
  selector: 'main-header',
  templateUrl: 'main-header.html'
})
export class MainHeaderComponent {
  @Input() withMenu: boolean = false;
  @Input() withBackButton: boolean = false;

  constructor (public navCtrl: NavController,
              public config: ConfigProvider,
              public translate: TranslateProvider) {

    console.log('main header');

    setInterval(() => {
      this.config.getMenuState();
    }, 1000);
  }

  /**
   *
   */
  goBack () {
    console.log('go back');


    if (this.navCtrl.canGoBack()) {
      this.navCtrl.pop();
    } else {
      this.navCtrl.setRoot('Cities');
    }
  }
}
