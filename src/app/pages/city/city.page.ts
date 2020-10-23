import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService } from './../../services/api.service';
import { forkJoin } from 'rxjs';
import { minifyString } from './../../utils/helper';
import { GeolocService } from 'src/app/services/geoloc.service';
import { LoadingController, IonItem, IonContent } from '@ionic/angular';

@Component({
  selector: 'app-city',
  templateUrl: './city.page.html',
  styleUrls: ['./city.page.scss'],
})
export class CityPage implements OnInit {
  @ViewChildren(IonItem) listItems: IonItem[];

  city: any;

  // Variables contenant les données trié.
  parcours: Array<any> = new Array();
  places: Array<any> = new Array();

  curPositionUser: any = {
    'longitude': '',
    'latitude': ''
  };
  // TODO: click list-item callback
  selectedItemId: string = null;

  isListOpen = false;
  selectedTarget: boolean = false;
  isParcoursSelected = true;
  isPlacesSelected = false;

  // Tri par défaut sélectionné qui est par proximité.
  optionsItemsSelected: number = 1;
  optionsItems = [
    {
      id: 0,
      action: 'alpha'
    },
    {
      id: 1,
      action: 'proximite'
    },
  ];
  constructor(
    public translate: TranslateService,
    private geoloc: GeolocService,
    private activatedRoute: ActivatedRoute,
    private loader: LoadingController,
    public api: ApiService
  ) {
    this.translate.onLangChange.subscribe(() => {
      this.initCityData();
    })
  }
  ngOnInit() {
    this.initCityData();
  }

  /**
   * get all data for city page
   */

  async initCityData() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    let closest = '';
    if(id) {
      const loading = await this.loader.create();
      loading.present();
      const cityRequest = this.api.get(`/public/cities/byId/${id}?lang= ${this.translate.currentLang}`);
      try {
        this.curPositionUser = await this.geoloc.getCurrentCoords();
        closest = `${this.curPositionUser.latitude};${this.curPositionUser.longitude}`;
      } catch (err){
        console.log(err)
      }
      const parcoursRequest = this.fetchParcours(id, closest);
      const placesRequest = this.fetchPlaces(id, closest);
      forkJoin([cityRequest, parcoursRequest, placesRequest])
      .subscribe((resp: any) => {
        const [city, parcours, places] = resp;
        this.city = city.data;
        this.parcours = parcours.data.filter((item: any) => {
          return item.force_lang === null || item.force_lang === this.translate.currentLang;
        });
        this.places = places.data.filter((item: any) => {
          return item.force_lang === null || item.force_lang === this.translate.currentLang;
        });
        loading.dismiss();
      })
    }
  }

  /**
   * fetch places of the city
   */
  fetchPlaces(cityId: string, closest: string = '') {
    const path = closest === ''
      ? `/public/interests/byCityId/${cityId}?lang=${this.translate.currentLang}`
      : `/public/interests/closest/?city=${cityId}&geoloc=${closest}&lang=${this.translate.currentLang}`;
    return this.api.get(path);
  }

   /**
   * fetch places of the city
   */
  fetchParcours(cityId: string, closest: string = '') {
    const path = closest === ''
      ? `/public/parcours/byCityId/${cityId}?lang=${this.translate.currentLang}`
      : `/public/parcours/closest/${cityId}?geoloc=${closest}&lang=${this.translate.currentLang}`;
    return this.api.get(path);
  }

  /**
   * Return les points d'intérêt relié à un id de parcours
   * @param parcourId - id du parcours
   * @returns {any[]}
   */
  getPlacesByParcoursId(parcoursId: string) {
    return this.places.filter(place => {
      return place.parcours_id === parcoursId
    });
  }

   /**
   * Return un point d'intérêt relié à son id.
   * @param placeId
   * @returns {any[]}
   */
  getPlacesById(placeId: string) {
    return this.places.filter(place => {
      return place.id === placeId
    });
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
   * @param next
   * @param isFromClick
   */
  onChangeSelectedTarget(next: any, isFromClick = false) {

    this.isPlacesSelected = next === 'places';
    this.isParcoursSelected = next === 'parcours';
    if (isFromClick) {
      this.selectedTarget = next === 'places';
    }

    this.focusAnElement('#btnSortItemNext');
    // const target = next === 'place' ? 'point-of-interest' : 'parcours';
  }

  optionsItemClasse(itemId: number) {
    return {
      optionsItem: true,
      isSelected: this.optionsItemsSelected === itemId
    }
  };

  /**
   *
   */
  actionSortAlpha() {
    // Parcours.
    this.parcours = this.parcours.sort(this.sort_alpha);
    // Points d'intérêts.
    this.places = this.places.sort(this.sort_alpha);
  }

  /**
   *
   * @param a
   * @param b
   * @returns {number}
   */
  sort_alpha = (a, b) => {
    const aTitle = minifyString(a.title[this.translate.currentLang]);
    const bTitle = minifyString(b.title[this.translate.currentLang]);

    if (aTitle < bTitle) return -1;
    if (aTitle > bTitle) return 1;
    return 0;
  };

  onSelectItem (selectedItem: any) {
    this.selectedItemId = selectedItem.id;
    const focusElement = this.listItems.find((item: any) => item.el.id === selectedItem.id);
    focusElement["el"].scrollIntoView();
    // only open parcours contentList on click item
    if (this.isParcoursSelected) {
      this.openContentList();
    }
  }

  actionSortProximite(msgAlertError: string = '') {
    return new Promise(async (success, error) => {
      const loading = await this.loader.create();
      loading.present();
      // Triage en fonction que la géolocalition est disponible ou non.
      this.geoloc.getCurrentCoords().then((resp: any) => {
        const {latitude, longitude} = resp;
        this.curPositionUser = resp;
        if (this.parcours.length > 1) {
          this.fetchParcours(this.city.id, `${latitude};${longitude}`)
          .subscribe((parcours: any) => {
            this.parcours = parcours.data.filter((item: any) => {
              return item.force_lang === null || item.force_lang === this.translate.currentLang;
            });
            loading.dismiss();
          })
        }

        if (this.places.length > 1) {
          this.fetchPlaces(this.city.id, `${latitude};${longitude}`)
          .subscribe((places: any) => {
            this.places = places.data.filter((item: any) => {
              return item.force_lang === null || item.force_lang === this.translate.currentLang;
            });
            loading.dismiss();
          })
        }

        success(resp);
      }, (err: any) => {
        this.changeOptionListAction('alpha');
        loading.dismiss();
        error();
      });
    });
  }

  changeOptionListAction(nextAction: string) {
    const findAction = this.optionsItems.find(item => item.action === nextAction);
    if (typeof findAction !== 'undefined') {
      this.optionsItemsSelected = findAction.id;
      if (findAction.action === 'alpha') {
        this.actionSortAlpha();
      } else {
        this.actionSortProximite();
      }
    }
  }

  isOptionsActionSelected(actionName: string) {
    let isSelected = false;
    const findAction = this.optionsItems.find(item => item.action === actionName);
    if (typeof findAction !== 'undefined') {
      isSelected = this.optionsItemsSelected === findAction.id;
    }
    return isSelected;
  }

  // scrollToDiv (selector, to, duration) {
  //   const element: any = document.querySelector(selector);

  //   const easeInOutQuad =  (t, b, c, d) => {
  //     t /= d/2;
  //     if (t < 1) return c/2*t*t + b;
  //     t--;
  //     return -c/2 * (t*(t-2) - 1) + b;
  //   };

  //   let start = element.scrollTop,
  //     change = to - start,
  //     currentTime = 0,
  //     increment = 20;

  //   const animateScroll = () => {
  //     currentTime += increment;
  //     const val = easeInOutQuad(currentTime, start, change, duration);

  //     element.scrollTop = val;
  //     if (currentTime < duration) {
  //       setTimeout(animateScroll, increment);
  //     }
  //   };

  //   animateScroll();
  // }

  /**
   *
   */
  openContentList() {
    const duration = 570;
    // const selector = 'city-page-content';

    if (this.isListOpen) {
      this.isListOpen = false;
      // this.scrollToDiv(selector, 0, duration);
    } else {
      this.isListOpen = true;
      //noinspection TypeScriptUnresolvedFunction
      // const contentHeight: any = document.querySelector('#previewByCityContent .scroll-content');

      // if (contentHeight !== null) {
      //   this.scrollToDiv(selector, contentHeight.offsetHeight, duration);

      //   if (data !== null) {
      //     setTimeout(() => {
      //       const itemIdSelector = '#' + data.target + '-' + data.id;
      //       this.focusAnElement(itemIdSelector);
      //     }, 300);
      //   }
      // }
    }
  }
}
