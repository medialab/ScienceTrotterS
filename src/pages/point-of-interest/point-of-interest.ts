import {Component, ViewChild} from '@angular/core';
import {Content, Events, IonicPage, NavController, NavParams} from 'ionic-angular';
import {ApiProvider} from "../../providers/api";
import {TranslateProvider} from "../../providers/translate";
import {ConfigProvider} from "../../providers/config";
import { Platform } from 'ionic-angular';
import {LocalDataProvider} from "../../providers/localData";

@IonicPage()
@Component({
  selector: 'page-point-of-interest',
  templateUrl: 'point-of-interest.html',
})
export class PointOfInterestPage {
  @ViewChild(Content) content: Content;

  isActivePage: boolean = false;
  isOnUpdateLanguage: boolean = false;
  helpItemActive = '';
  curTarget: string = '';
  curId: string = '';
  pageName: string = '';
  createdAt: string = '';

  _interests: Array<any> = new Array();
  interests: Array<any> = new Array();

  getInterests () {
    return this._interests.filter((item: any) => {
      return item.isDone === false && (item.item.force_lang === null || item.item.force_lang === this.config.getLanguage())
    });
  }

  activeItem = 0;

  mainContentCls = {
    mainContent: true,
    isHidden: false,
  };

  constructor (public navCtrl: NavController,
               public navParams: NavParams,
               public api: ApiProvider,
               public config: ConfigProvider,
               public translate: TranslateProvider,
               public events: Events,
               public localData: LocalDataProvider,
               public platform : Platform) {
    this.curTarget = navParams.get('target');
    this.curId = navParams.get('openId');
    this.createdAt = navParams.get('createdAt');
    this.pageName = navParams.get('pageName') ? navParams.get('pageName') : "";
    this.init(navParams.get('target'), navParams.get('openId'));

    events.subscribe('config:updateLanguage', () => {
      this.isOnUpdateLanguage = true;
    });
  }

  onUpdateLanguage () {
    this.isOnUpdateLanguage = false;

    if (this.interests.length === 0) {
      this.navCtrl.pop();
    }
  }

  ionViewDidEnter () {
    this.isActivePage = true;

    if (this.isOnUpdateLanguage) {
      this.onUpdateLanguage();
    }
  }

  ionViewWillLeave () {
    this.isActivePage = false;
  }

  /**
   *
   * @param curTarget
   * @param curId
   */
  init(curTarget: string, curId: string) {
    this.fetchData(curTarget, curId);
  }

  /**
   *
   * @param elementId
   */
  scrollTo (elementId: string) {
    const yOffset = document.getElementById(elementId).offsetTop - 56;
    if (this.content.scrollTo !== null) {
      this.content.scrollTo(0, yOffset, 1000);
    }
  }

  /**
   *
   * @param curTarget
   * @param curId
   */
  fetchData (curTarget: string, curId: string) {
    let resURI = '';
    resURI = curTarget === 'interests'
      ? '/public/interests/byId/'
      : '/public/interests/byParcourId/';

    this.api.get(resURI + curId).subscribe((resp: any) => {
      if (resp.success) {
        this._interests = resp.data.map((item: any) => {
          return {
            'isDone': false,
            'item': item
          };
        });

        this.interests = this.getInterests();
      }
    }, (error: any) => {
      console.log('error fetchPOI', error);
    });
  }

  /**
   *
   * @param dir
   * @returns {boolean}
   */
  showMoveBtn (dir: string) {
    let show = false;

    switch (dir) {
      case 'prev':
        show =  this.activeItem === 0 ? false : true;
        break;
      case 'next':
        if (this.interests.length > (this.activeItem + 1)) {
          show = true;
        } else {
          show = false;
        }
        break;
    }

    return show;
  }

  /**
   *
   * @param target
   */
  setHelpItemActive (target: string) {
    this.helpItemActive = target;
  }

  /**
   *
   * @param action
   */
  updateMainContentState (action: boolean) {
    this.mainContentCls.isHidden = action ? false: true;
  }

  /**
   *
   * @param dir
   */
  onClickMoveList (dir: string) {
    switch (dir) {
      case 'prev':
        if (this.activeItem > 0) {
          this.activeItem = this.activeItem - 1;
          this.onClickSetHelpItemActive(null);
        }
        break;
      case 'next':
        if (this.interests.length > (this.activeItem + 1)) {
          this.activeItem = this.activeItem + 1;
          this.onClickSetHelpItemActive(null);
        } else {
          this.activeItem = 0;
        }
        break;
    }
  }

  /**
   *
   * @param target
   */
  onClickSetHelpItemActive (target: string) {
    if (target === null && this.helpItemActive !== '') {
      document.querySelector(`#${this.helpItemActive}`).setAttribute('aria-expanded', 'false');
      this.focusAnElement(`#${this.helpItemActive}`);
      this.setHelpItemActive('');
      this.updateMainContentState(true);
    } else if (target !== null) {
      if (this.helpItemActive === target) {
        document.querySelector(`#${target}`).setAttribute('aria-expanded', 'false');
        this.setHelpItemActive('');
        this.updateMainContentState(true);
      } else {
        if (this.helpItemActive !== '') {
          document.querySelector(`#${this.helpItemActive}`).setAttribute('aria-expanded', 'false');
        }
        document.querySelector(`#${target}`).setAttribute('aria-expanded', 'true');
        this.setHelpItemActive(target);
        this.updateMainContentState(false);
      }
    }
  }

  /**
   * Retourne le nombre de photo à afficher. (Il faut en afficher d'avantage sur ipad).
   * @returns {number}
   */
  getNbPicture () {
    if(this.platform.is('tablet')){
      return 3;
    } else {
      return 1.5;
    }
  }

  showBiblio () {
    const biblio = this.getData('bibliography', true);
    let isShow = false;

    for (const itemDesc of biblio) {
      if (itemDesc !== '') {
        isShow = true;
        break;
      }
    }

    return isShow;
  }
  /**
   *
   * @param target
   * @param isMainContent
   * @returns {any}
   */
  getHelpItemActive (target: string, isMainContent: boolean = false) {
    if (isMainContent && this.helpItemActive !== '') {
      return 'isActive';
    }  else {
      return this.helpItemActive !== target ? 'isHidden' : 'isActive';
    }
  }

  /**
   *
   * @param key
   * @param translate
   * @returns {any}
   */
  getData (key: string, translate: boolean = false) {
    let value = "";

    if (typeof this.interests[this.activeItem] === 'undefined') {
      return '';
    } else {
      if (! translate) {
        return this.interests[this.activeItem].item[key];
      } else {
        return this.translate.fromApi(this.config.getLanguage(), this.interests[this.activeItem].item[key]);
      }
    }
  }

  /**
   *
   * @param str
   * @param length
   * @returns {string}
   */
  sliceStr (str: string, length: number) {
    if (str.length > length) {
      return str.slice(0, (length - 3)) + '...';
    } else {
      return str.slice(0, length);
    }
  }

  /**
   * TODO : dynamic data
   * Envoi d'un message pour signaler un problème
   * par mail.
   */
  btnReportProblem () {
    const subject = {
      'fr': 'btnReportProblem FR',
      'en': 'btnReportProblem EN'
    };

    this.sendMail(null, subject[this.config.getLanguage()]);
  }

  /**
   * TODO : dynamic data
   * Partage du point d'inrétêt courant par mail.
   */
  btnShareRef () {
    const subject = {
      'fr': 'btnShareRef FR',
      'en': 'btnShareRef EN'
    };
    let body = '';

    for (let itemDesc of this.getData('bibliography', true)) {
      body += itemDesc + '%0D%0A';
    }

    this.sendMail(null, subject[this.config.getLanguage()], body);
  }

  /**
   * Ouverture du client mail par défault pour l'envoi
   * d'un mail.
   *
   * @param subject
   */
  sendMail (to: string = '', subject: string = '', body: string = '') {
    if (to === '' || to === null) {
      to = this.config.data.contact_mail;
    }

    const sendMail = window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_system');
  }

  /**
   *
   */
  btnEndPointOfInterest () {
    const data = {
      'uuid': this.getData('id'),
      'created_at': this.getData('updated_at'),
      'name': this.getData('title', true)
    };

    // Par défaut on enregistre le POI comme étant terminé.
    this.localData.addPOIDone(data, this.config.getLanguage());

    if (this.interests.length === 1) {
      // --> Ajout de l'item courant dans la liste des parocurs ou point d'intérêt done.

      if (this.curTarget === 'parcours') {
        data.uuid = this.curId;
        data.created_at = this.createdAt;
        this.localData.addParcoursDone(data, this.config.getLanguage());
      }

      // --> On retourne à la page précèdente (liste poi ou parcours).
      this.navCtrl.pop();

    } else {
      // Enregistrement du point d'intérêt éffectué dans la liste courante.
      this._interests[this.activeItem].isDone = true;
      this._interests = this.getInterests();
      this.interests = this.getInterests();

      if (this.activeItem > 0) {
        this.activeItem -=1;
      }

      this.onClickSetHelpItemActive(null);
    }
  }

  /**
   *
   * @returns {any}
   */
  getGalleryImages () {
    if (typeof this.getData('gallery_image') === 'undefined') {
      return [];
    } else {
      return Object
        .values(this.getData('gallery_image'))
        .map((img: string) => this.api.getAssetsUri(img));
    }
  }

  focusAnElement (element: string) {
    const el = <HTMLElement>document.querySelector(element);
    if (el !== null) {
      //noinspection TypeScriptUnresolvedFunction
      el.focus();
    }
  }

  openMapToLocation () {
    const geoloc: any = this.getData('geoloc');
    const openMap = window.open(`http://maps.apple.com/?daddr=${geoloc.latitude},${geoloc.longitude}`);
  }

  showSliderPager () {
    return this.getGalleryImages().length > 1;
  }
}
