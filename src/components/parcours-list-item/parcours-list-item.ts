import {Component, Input} from '@angular/core';
import {TranslateProvider} from "../../providers/translate";
import {Events, NavController, NavParams} from "ionic-angular";
import {LocalDataProvider} from "../../providers/localData";
import {ConfigProvider} from "../../providers/config";

@Component({
  selector: 'parcours-list-item',
  templateUrl: 'parcours-list-item.html',
})
export class ParcoursListItemComponent {
  _isOpenDiscover: boolean = false;

  @Input() handler: any = null;
  @Input() openId: string = '';
  @Input() previewTitle: string = '';
  @Input() previewDescription: string = '';
  @Input() color: string = '';
  @Input() target: string = '';
  @Input() parcourTotalInterets: number = 0;
  @Input() parcourTime: string = '';
  @Input() interestAddress: string = '';
  @Input() audioURI: string = '';
  @Input()
  set isOpenDiscover(nextState: boolean) {
    this._isOpenDiscover = nextState;
  }
  get isOpenDiscover() {
    return this._isOpenDiscover;
  }

  constructor (public localData: LocalDataProvider,
               public translate: TranslateProvider,
               public config: ConfigProvider,
               public navParams: NavParams,
               public events: Events,
               public navCtrl: NavController) {
    // -->.
  }

  ngOnChanges () {
    if (this.handler !== null) {
      this.handlerOnClickItemMap(this.handler);
      this.handler = null;
    }
  }

  /**
   * @ref components/box-map
   * @param e
   */
  handlerOnClickItemMap = ({target, id}) => {
    if (id === this.openId) {
      this.updateDiscoverStateOrOpen();
    }
  };

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

  isDone () {
    const isDone = this.target === 'parcours'
      ? this.localData.isParcoursIsDone(this.openId, this.config.getLanguage())
      : this.localData.isPOIIsDone(this.openId, this.config.getLanguage())
    ;

    return {
      'isDone': isDone
    };
  }
}
