import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService } from './../../services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-city',
  templateUrl: './city.page.html',
  styleUrls: ['./city.page.scss'],
})
export class CityPage implements OnInit {
  city: any;

  // Variables contenant les données trié.
  parcours: Array<any> = new Array();
  places: Array<any> = new Array();

  curPositionUser: object = {
    'longitude': '',
    'latitude': ''
  };

  isListOpen = false;
  selectedTarget: boolean = false;
  isParcoursSelected = true;
  isPlacesSelected = false;

  // Tri par défaut sélectionné qui est par proximité.
  optionsItemsSelected: number = 1;
  otpionsItems = [
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
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private api: ApiService
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

  initCityData() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    const closest = ''; // TODO: enable geoloc
    if(id) {
      const cityRequest = this.api.get(`/public/cities/byId/${id}?lang= ${this.translate.currentLang}`);
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
      : `/public/parcours/closest/?city=${cityId}&geoloc=${closest}&lang=${this.translate.currentLang}`;
    return this.api.get(path);
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

    // this.getParcours();
    // this.getInterests();

    // const target = next === 'place' ? 'point-of-interest' : 'parcours';

    // this.events.publish('previewByCity::onChangeSelectedTarget', target);
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
    // this.parcours = this.parcours.sort(this.sort_alpha);

    // Points d'intérêts.
    // this.places = this.places.sort(this.sort_alpha);
  }


  actionSortProximite (msgAlertError: string = '') {
    // return new Promise(async (success, error) => {
    //   // Triage en fonction que la géolocalition est disponible ou non.
    //   this.geoloc.getCurrentCoords(msgAlertError).then(async (resp: any) => {
    //     const {latitude, longitude} = resp;

    //     this.curPositionUser = {
    //       'longitude': resp.longitude,
    //       'latitude': resp.latitude
    //     };

    //     if (this.parcours.length > 1) {
    //       this.fetchParcours(this.city.id, `${latitude};${longitude}`);
    //     }

    //     if (this.places.length > 1) {
    //       this.fetchPlaces(this.city.id, `${latitude};${longitude}`);
    //     }

    //     success(resp);
    //   }, (err: any) => {
    //     this.changeOptionListAction('alpha');
    //     error();
    //   });
    // });
  }

  changeOptionListAction(nextAction: string) {
    const findAction = this.otpionsItems.find(item => item.action === nextAction);
    if (typeof findAction !== 'undefined') {
      this.optionsItemsSelected = findAction.id;
      if (findAction.action === 'alpha') {
        this.actionSortAlpha();
      } else {
        this.actionSortProximite()
        // .then((data: any) => {
        //   this.events.publish('previewByCity::updateCurrentGeoLoc', data);
        // })
        // .catch(() => {});
      }
    }
  }

  isOptionsActionSelected(actionName: string) {
    let isSelected = false;
    const findAction = this.otpionsItems.find(item => item.action === actionName);
    if (typeof findAction !== 'undefined') {
      isSelected = this.optionsItemsSelected === findAction.id;
    }
    return isSelected;
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
