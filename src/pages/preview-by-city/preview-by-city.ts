import {Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {App, Content, Events, IonicPage, NavController, NavParams} from 'ionic-angular';
import {TranslateProvider} from "../../providers/translate";
import leaflet from 'leaflet';
import {ConfigProvider} from "../../providers/config";
import {ApiProvider} from "../../providers/api";

@IonicPage()
@Component({
  selector: 'page-preview-by-city',
  templateUrl: 'preview-by-city.html',
})

export class PreviewByCityPage {
  @ViewChild(Content) content: Content;

  map: any;

  city: any;

  _parcours: Array<any> = new Array();
  _interests: Array<any> = new Array();

  get parcours () {
    return this._parcours.filter((item: any) => {
      return item.force_lang === null || item.force_lang === this.config.getLanguage();
    });
  }

  get interests () {
    return this._interests.filter((item: any) => {
      return item.force_lang === null || item.force_lang === this.config.getLanguage();
    });
  }
  
  contentListClass = {
    contentList: true,
    isOpen: false
  };

  optionsItemsSelected: number = 0;
  otpionsItems = [
    {
      id: 0,
      name: this.translate.getKey('PLI_FILTER_PROXIMITE'),
      action: 'proximite'
    },
    {
      id: 1,
      name: this.translate.getKey('PLI_FILTER_ALPHA'),
      action: 'alpha'
    }
  ];

  optionsItemClasse(itemId: number) {
    return {
      optionsItem: true,
      isSelected: this.optionsItemsSelected === itemId
    }
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
              public config: ConfigProvider,
              public api: ApiProvider,
              public events: Events,
              public translate: TranslateProvider) {

    if (typeof navParams.get('city') !== 'undefined') {
      this.city = navParams.get('city');
      this.loadParcours();
      this.loadInterests();

      /**
       * TODO : LISTENER ON UPDATE LANGUAGE.
       */
     // events.subscribe('config:updateLanguage', this.onUpdateLanguage.bind(this));
    }
  }

  onUpdateLanguage () {
    console.log('ok');
  }

  focusAnElement (element: string) {
    const el = <HTMLElement>document.querySelector(element);
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
    // this.loadMap();
  }

  /**
   *
   */
  openContentList() {
    const duration = 500;

    if (this.contentListClass.isOpen) {
      if (this.content.scrollTo !== null) {
        this.contentListClass.isOpen = false;
        this.content.scrollTo(0, 0, duration);
      }
    } else {
      if (this.content.scrollToBottom !== null) {
        this.contentListClass.isOpen = true;
        this.content.scrollToBottom(duration);
      }
    }
  }
  on

  /**
   *
   * @constructor
   */
  onClickItem () {
    if (! this.contentListClass.isOpen) {
      this.openContentList();
    }
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
    setTimeout(() => {
      if (typeof document.querySelector('.list li:first-child') !== null) {
        this.focusAnElement('.list li:first-child parcours-list-item .parcoursListItem .contentPreview button.info');
      }
    }, 100);
  }

  /**
   *
   */
  loadParcours() {
    this.api.get('/public/parcours/byCityId/' + this.city.id).subscribe((resp: any) => {
      if (resp.success) {
        this._parcours = resp.data;
      }
    }, (error: any) => {
      console.log('error', error);
    });
  }

  /**
   *
   */
  loadInterests() {
    this.api.get('/public/interests/byCityId/' + this.city.id).subscribe((resp: any) => {
      if (resp.success) {
        this._interests = resp.data;
      }
    }, (error: any) => {
      console.log('error', error);
    });
  }

  /**
   *
   * @param parcourId
   * @returns {number}
   */
  getTotalInterestsByParcourId(parcourId: string) {
    return this.interests.filter(interest => {
      return interest.parcours_id === parcourId
    }).length;
  }

  /**
   *
   * @param arr
   * @returns {any}
   */
  sortItems (arr: any) {
    const sort_alpha = (a, b) => {
      const aTitle = this.minifyString(this.translate.fromApi(this.config.getLanguage(), a.title));
      const bTitle = this.minifyString(this.translate.fromApi(this.config.getLanguage(), b.title));

      if (aTitle < bTitle) return -1;
      if (aTitle > bTitle) return 1;
      return 0;
    };

    const sort_proximite = (a, b) => {
      const aTitle = this.minifyString(this.translate.fromApi(this.config.getLanguage(), a.title));
      const bTitle = this.minifyString(this.translate.fromApi(this.config.getLanguage(), b.title));

      if (aTitle > bTitle) return -1;
      if (aTitle < bTitle) return 1;
      return 0;
    };

    switch (this.otpionsItems[this.optionsItemsSelected].action) {
      case 'alpha':
        return arr.sort(sort_alpha);
      case 'proximite':
        return arr.sort(sort_proximite);
      default:
        return arr;
    }
  }

  /**
   *
   * @param str
   * @returns {string}
   */
  minifyString(str: string) {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  /**
   *
   */
  loadMap() {
    /**
    this.map = leaflet.map("map").fitWorld();
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);
    this.map.locate({
      setView: true,
      maxZoom: 10
    }).on('locationfound', (e) => {
      let markerGroup = leaflet.featureGroup();
      let marker: any = leaflet.marker([e.latitude, e.longitude]).on('click', () => {
        alert('Marker clicked');
      })

      markerGroup.addLayer(marker);
      this.map.addLayer(markerGroup);
    }).on('locationerror', (err) => {
      alert(err.message);
    })
    */
  }
}
