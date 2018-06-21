import {Component, Input} from '@angular/core';
import {TranslateProvider} from "../../providers/translate";
import {NavController} from "ionic-angular";

@Component({
  selector: 'parcours-list-item',
  templateUrl: 'parcours-list-item.html'
})
export class ParcoursListItemComponent {
  _isOpenDiscover: boolean = false;

  contentDiscover = {
    contentDiscover: true,
    isOpen: false
  };

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
    this.contentDiscover.isOpen = nextState;
  }
  get isOpenDiscover() {
    return this._isOpenDiscover;
  }

  constructor (public translate: TranslateProvider,
              public navCtrl: NavController) {
  }

  /**
   *
   */
  updateDiscoverState () {
    if (this.isOpenDiscover) {
      this.isOpenDiscover = false;
      this.contentDiscover.isOpen = false;
    } else {
      this.isOpenDiscover = true;
      this.contentDiscover.isOpen = true;
    }
  }

  /**
   *
   */
  openNext () {
    this.navCtrl.push('PointOfInterest', {
      target: this.target,
      openId: this.openId,
      pageName: this.previewTitle
    });
  }
}
