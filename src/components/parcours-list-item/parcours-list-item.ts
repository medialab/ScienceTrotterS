import {Component, Input} from '@angular/core';
import {TranslateProvider} from "../../providers/translate";
import {NavController, NavParams} from "ionic-angular";

@Component({
  selector: 'parcours-list-item',
  templateUrl: 'parcours-list-item.html',
})
export class ParcoursListItemComponent {
  _isOpenDiscover: boolean = false;

  @Input() openId: string = '';
  @Input() previewTitle: string = '';
  @Input() previewDescription: string = '';
  @Input() color: string = '';
  @Input() target: string = '';
  @Input() parcourTotalInterets: number = 0;
  @Input() parcourTime: string = '';
  @Input() interestAddress: string = '';
  @Input()
  set isOpenDiscover(nextState: boolean) {
    this._isOpenDiscover = nextState;
  }
  get isOpenDiscover() {
    return this._isOpenDiscover;
  }

  constructor (public translate: TranslateProvider,
              public navParams: NavParams,
              public navCtrl: NavController) {
  }

  /**
   * Met à jour l'état du dropdown contenant les informations.
   */
  updateDiscoverStateOrOpen () {
    if (this.target === 'interests') {
      this.openNext();
    } else {
      this.isOpenDiscover = this.isOpenDiscover ? false : true;
    }
  }

  /**
   * Ouvre la page "PointOfInterest"
   */
  openNext () {
    this.navCtrl.push('PointOfInterest', {
      target: this.target,
      openId: this.openId,
      pageName: this.previewTitle
    });
  }
}
