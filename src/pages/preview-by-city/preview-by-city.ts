import {Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {App, Content, Events, IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import {TranslateProvider} from "../../providers/translate";
import {ConfigProvider} from "../../providers/config";
import {ApiProvider} from "../../providers/api";
import {GeolocProvider} from "../../providers/geoloc";
import {AlertProvider} from "../../providers/alert";
import { ConnectionStatus, NetworkService } from './../../providers/network';

@IonicPage()
@Component({
  selector: 'page-preview-by-city',
  templateUrl: 'preview-by-city.html',
})

export class PreviewByCityPage {
  @ViewChild(Content) content: Content;

  eventOnClickItemMapName = 'boxMap::onClickItemMap';

  city: any;
  curPositionUser: object = {
    'longitude': '',
    'latitude': ''
  };

  lastScrollKnown: number = 0;

  // Variables contenant les données non trié.
  _parcours: Array<any> = new Array();
  _interests: Array<any> = new Array();

  // Variables contenant les données trié.
  parcours: Array<any> = new Array();
  interests: Array<any> = new Array();

  parcoursListItemHandler: any = null;
  eventUpdateLanguage: any = null;

  isLoadingAlert: boolean = false;

  /**
   * Filtre les parcours suivant les critères.
   * @returns {any[]}
   */
  getParcours () {
    return new Promise(async (res) => {

      this.parcours = await this._parcours.filter((item: any) => {
        return item.force_lang === null || item.force_lang === this.config.getLanguage();
      });

      res();
    });
  }

  /**
   * Filtre les points d'intérêts suivant les critères.
   * @returns {any[]}
   */
  getInterests () {
    return new Promise(async (res) => {

      this.interests = await this._interests.filter((item: any) => {
        return item.force_lang === null || item.force_lang === this.config.getLanguage();
      });

      res();
    });
  }

  itemsList : Array<any> = new Array();

  contentListClass = {
    contentList: true,
    isOpen: false
  };

  mapClassNames = {
    isClose: false
  };

  // Tri par défaut sélectionné qui est par proximité.
  optionsItemsSelected: number = 1;
  otpionsItems = [
    {
      id: 0,
      name: () => (this.translate.getKey('PLI_FILTER_ALPHA')),
      action: 'alpha'
    },
    {
      id: 1,
      name: () => (this.translate.getKey('PLI_FILTER_PROXIMITE')),
      action: 'proximite'
    },
  ];

  optionsItemClasse(itemId: number) {
    return {
      optionsItem: true,
      isSelected: this.optionsItemsSelected === itemId
    }
  };

  changeOptionListAction(nextAction: string) {
    const findAction = this.otpionsItems.find(item => item.action === nextAction);
    if (typeof findAction !== 'undefined') {
      this.optionsItemsSelected = findAction.id;
      this.changeOptionListHandler();
    }
  }

  isOptionsActionSelected(actionName: string) {
    const classList = {
      isSelected: false
    };
    const findAction = this.otpionsItems.find(item => item.action === actionName);
    if (typeof findAction !== 'undefined') {
      classList.isSelected = this.optionsItemsSelected === findAction.id;
    }
    return classList;
  }

  selectedTarget: boolean = false;

  selectTargetParcours = {
    selectedTarget: true,
    isSelected: true
  };

  selectTargetPoints = {
    selectedTarget: true,
    isSelected: false
  };

  constructor(public app: App,
              private renderer: Renderer2,
              public navCtrl: NavController,
              public navParams: NavParams,
              public geoloc: GeolocProvider,
              public config: ConfigProvider,
              public platform: Platform,
              public alert: AlertProvider,
              public api: ApiProvider,
              public events: Events,
              public translate: TranslateProvider,
              private networkService: NetworkService) {

    if (typeof navParams.get('city') !== 'undefined') {
      this.city = navParams.get('city');
      this.init();
    }
  }

  async init () {
    if (this.isNetWorkOff()) {
      this.optionsItemsSelected = 1;
    }

    this.loadInterests().then(() => {
      this.loadParcours().then(() => {

        if (this.parcours.length === 0) {
          // Si aucun parcours n'est disponible on affiche
          // les points d'intérêt par défaut.
          this.onChangeSelectedTarget({'checked': true}, true);
        }

        this.changeOptionListHandler();
        this.events.publish('previewByCity::initMapData', {
          'parcours': this.parcours,
          'interests': this.interests
        });
      });
    });
  }

  onUpdateLanguage = () => {
    this.init();
    this.updateCityData();
  };

  updateCityData () {
    this.api.get('/public/cities/byId/' + this.city.id).subscribe(async (resp: any) => {
      this.city = resp.data;
    }, (onError) => {
    });
  }

  isNetWorkOff() {
    return this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline ? true : false
  }

  focusAnElement (element: string) {
    const el: any = document.querySelector(element);
    if (el !== null) {
      //noinspection TypeScriptUnresolvedFunction
      el.focus();
    }
  }

  /**
   *
   * @returns {boolean}
   */
  ionViewCanEnter () {
    return this.city.id === null ? false : true;
  }

  /**
   *
   */
  ionViewDidEnter() {
    const eventName = 'boxMap::onClickItemMap';

    if (this.eventUpdateLanguage === null) {
      this.eventUpdateLanguage = this.events.subscribe('config:updateLanguage', this.onUpdateLanguage);
    }

    // -->.
    this.events.subscribe(this.eventOnClickItemMapName, (data: any) => {
      // Handler for event on a component.
      this.parcoursListItemHandler = data;
      setTimeout(() => {this.parcoursListItemHandler = null;}, 250);

      // Ouverture de la liste.
      this.openContentList(data);
    });

    // -->.
    this.events.subscribe('boxMap::updateCurrentGeoLoc', () => {
      this.actionSortProximite('ALERT_BTN_GEOLOC')
        .then((data: any) => {
          this.events.publish('previewByCity::updateCurrentGeoLoc', data);
        })
        .catch(() => {
          console.log('error');
        });
    });

    /**
    const connected = this.network.onConnect().subscribe((data) => {
    // HANDLE NETWORK ON CONNECT.
    }, (onError) => {
    });
     */
  }

  ionViewWillUnload () {
    this.eventUpdateLanguage = null;
    this.events.unsubscribe('config:updateLanguage', this.onUpdateLanguage);
    this.events.unsubscribe(this.eventOnClickItemMapName);
    this.events.unsubscribe('boxMap::updateCurrentGeoLoc');
    this.events.publish('previewByCity::ionViewWillLeave');
  }

  ionViewDidLoad() {
  }

  /**
   *
   */
  ionViewWillLeave() {
  }

  scrollToDiv (selector, to, duration) {
    const element: any = document.querySelector(selector);

    const easeInOutQuad =  (t, b, c, d) => {
      t /= d/2;
      if (t < 1) return c/2*t*t + b;
      t--;
      return -c/2 * (t*(t-2) - 1) + b;
    };

    let start = element.scrollTop,
      change = to - start,
      currentTime = 0,
      increment = 20;

    const animateScroll = () => {
      currentTime += increment;
      const val = easeInOutQuad(currentTime, start, change, duration);

      element.scrollTop = val;
      if (currentTime < duration) {
        setTimeout(animateScroll, increment);
      }
    };

    animateScroll();
  }

  /**
   *
   */
  openContentList(data: any = null) {
    const duration = 570;
    const selector = '#previewByCityContent .scroll-content';

    if (this.contentListClass.isOpen) {
      this.contentListClass.isOpen = false;
      this.mapClassNames.isClose = false;
      this.scrollToDiv(selector, 0, duration);
    } else {
      this.contentListClass.isOpen = true;
      this.mapClassNames.isClose = true;
      //noinspection TypeScriptUnresolvedFunction
      const contentHeight: any = document.querySelector('#previewByCityContent .scroll-content');

      if (contentHeight !== null) {
        this.scrollToDiv(selector, contentHeight.offsetHeight, duration);

        if (data !== null) {
          setTimeout(() => {
            const itemIdSelector = '#' + data.target + '-' + data.id;
            this.focusAnElement(itemIdSelector);
          }, 300);
        }
      }
    }
  }

  /**
   *
   * @constructor
   */
  onClickItem () {
    if (! this.contentListClass.isOpen) {
      this.openContentList();
    }
  }

  handleScroll(e: any) {
    console.log('handleScroll');
  }

  /**
   *
   * @returns {string|string}
   */
  currentOpenIcon() {
    return this.contentListClass.isOpen ? 'ios-arrow-down': 'ios-arrow-up';
  }

  /**
   *
   * @param next
   * @param isFromClick
   */
  onChangeSelectedTarget(next: any, isFromClick = false) {

    this.selectTargetPoints.isSelected = next.checked === true;
    this.selectTargetParcours.isSelected = next.checked === false;
    if (isFromClick) {
      this.selectedTarget = next.checked;
    }

    this.focusAnElement('#btnSortItemNext');

    this.getParcours();
    this.getInterests();

    const target = next.checked === true ? 'point-of-interest' : 'parcours';

    this.events.publish('previewByCity::onChangeSelectedTarget', target);
  }

  /**
   *
   * @param next
   */
  changeOptionList(next: string) {
    switch (next) {
      case 'prev':
        if (this.optionsItemsSelected > 0) {
          this.optionsItemsSelected -= 1;
        } else {
          this.optionsItemsSelected = this.otpionsItems.length - 1;
        }
        break;
      case 'next':
        if (this.optionsItemsSelected < (this.otpionsItems.length - 1)) {
          this.optionsItemsSelected += 1;
        } else {
          this.optionsItemsSelected = 0;
        }
        break;
    }

    // TODO : Attendre la fin du tri pour mettre le focus sur le premier element de la liste.
    /**
    setTimeout(() => {
      if (typeof document.querySelector('.list li:first-child') !== null) {
        this.focusAnElement('.list li:first-child parcours-list-item .parcoursListItem .contentPreview button.info');
      }
    }, 100);
    */

    // -->/
    this.changeOptionListHandler();
  }

  /**
   *
   */
  changeOptionListHandler () {
    switch (this.otpionsItems[this.optionsItemsSelected].action) {
      case 'alpha':
        this.actionSortAlpha();
        break;
      case 'proximite':
        this.actionSortProximite()
          .then((data: any) => {
            this.events.publish('previewByCity::updateCurrentGeoLoc', data);
          })
          .catch(() => {
          });
        break;
    }
  }

  actionSortProximite (msgAlertError: string = '') {
    return new Promise(async (success, error) => {
      // Triage en fonction que la géolocalition est disponible ou non.
       this.geoloc.getCurrentCoords(msgAlertError).then(async (resp: any) => {
        const {latitude, longitude} = resp;

        this.curPositionUser = {
          'longitude': resp.longitude,
          'latitude': resp.latitude
        };

        if (this.parcours.length > 1) {
          await this.loadParcours(`${latitude};${longitude}`);
        }

        if (this.interests.length > 1) {
          await this.loadInterests(`${latitude};${longitude}`);
        }

        success(resp);
      }, (err: any) => {
        this.changeOptionListAction('alpha');
        error();
      });
    });
  }

  /**
   *
   */
  actionSortAlpha() {
    // Parcours.
    this._parcours = this._parcours.sort(this.sort_alpha);
    this.getParcours();

    // Points d'intérêts.
    this._interests = this._interests.sort(this.sort_alpha);
    this.getInterests();
  }

  /**
   *
   * @param a
   * @param b
   * @returns {number}
   */
  sort_alpha = (a, b) => {
    const aTitle = this.minifyString(this.translate.fromApi(this.config.getLanguage(), a.title));
    const bTitle = this.minifyString(this.translate.fromApi(this.config.getLanguage(), b.title));

    if (aTitle < bTitle) return -1;
    if (aTitle > bTitle) return 1;
    return 0;
  };

  /**
   *
   */
  async loadParcours(closest: string = '') {
    const path = closest === ''
      ? `/public/parcours/byCityId/${this.city.id}?lang=${this.config.getLanguage()}`
      : `/public/parcours/closest/${this.city.id}?geoloc=${closest}&lang=${this.config.getLanguage()}`;

    return new Promise((res) => {
      this.api.get(path).subscribe(async (resp: any) => {
        if (resp.success) {
          this._parcours = resp.data;

          this.getParcours().then(() => {
            res();
          });
        }
      }, (error: any) => {
        res();
      });
    });
  }

  /**
   *
   */
   async loadInterests(closest: string = '') {
     const path = closest === ''
       ? `/public/interests/byCityId/${this.city.id}?lang=${this.config.getLanguage()}`
       : `/public/interests/closest/?city=${this.city.id}&geoloc=${closest}&lang=${this.config.getLanguage()}`;

    return new Promise((res) => {
      this.api.get(path).subscribe(async (resp: any) => {
        if (resp.success) {

          this._interests = resp.data;

          this.getInterests().then(() => {
            res();
          });
        }
      }, (error: any) => {
        res();
      });
    });
  }

  /**
   * Return les points d'intérêt relié à un id de parcours
   * @param parcourId - id du parcours
   * @returns {any[]}
   */
  getInterestsByParcoursId(parcoursId: string) {
    return this.interests.filter(interest => {
      return interest.parcours_id === parcoursId
    });
  }

  /**
   * Return un point d'intérêt relié à son id.
   * @param interestId
   * @returns {any[]}
   */
  getInterestsById(interestId: string) {
    return this.interests.filter(interest => {
      return interest.id === interestId
    });
  }
  /**
   *
   * @param str
   * @returns {string}
   */
  minifyString(str: string) {
    let _str = str;

    try {
      _str = (str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase());
    } catch (e) {

    }

    return _str;
  }

}
