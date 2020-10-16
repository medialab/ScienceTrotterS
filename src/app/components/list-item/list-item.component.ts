import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from './../../services/config.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
})
export class ListItemComponent implements OnInit {
  @Input() target: string = '';
  // @Input() openId: string = '';
  @Input() focusId: string = 'focusId';
  @Input() item: any;
  // @Input() previewTitle: string = '';
  // @Input() previewDescription: string = '';
  // @Input() color: string = '';
  @Input() parcourTime: string = '';
  @Input() createdAt: string = '';
  // @Input() interestAddress: string = '';
  // @Input() audioURI: string = '';
  @Input() geoloc: any = undefined;
  @Input() curPositionUser: any = undefined;
  @Input() handler: any = null;
  @Input() sortOrder: any = null;
  @Input() placesList: Array < any > = [];
  @Input() cityName: string = '';
  @Input() cityId: string = '';
  @Input() isDownloaded: boolean = false;

  isOpenDiscover: boolean = false;
  isShowTimeToObj: boolean = false;
  timeToObj = '';

  constructor(
    public translate: TranslateService,
    private config: ConfigService
  ) {}

  ngOnInit() {
  }

  isDone() {
    const data = {
      'uuid': this.item.id,
      'created_at': this.item.update_at
    };

    const isDone = false
    // this.target === 'parcours' ?
      // this.localData.isParcoursIsDone(data, this.config.getLanguage()) :
      // this.localData.isPOIIsDone(data, this.config.getLanguage());

    const hideIt = this.target === 'parcours' && parseInt(String(this.placesList.length)) === 0;

    return {
      'isDone': isDone,
      'hideIt': hideIt
    };
  }

  updateDiscoverStateOrOpen() {
    console.log('updateDiscoverStateOrOpen')
  }

  // TODO: enable geoloc
  // getDistance = (start, end) => {
  //   const rayon = 6378137;
  //   const toRadians = Math.PI / 180;
  //   let dist = 0;

  //   const a = (start.latitude * toRadians);
  //   const b = (start.longitude * toRadians);
  //   const c = (end.latitude * toRadians);
  //   const d = (end.longitude * toRadians);
  //   const e = Math.asin(Math.sqrt(Math.pow(Math.sin((a - c) / 2), 2) + Math.cos(a) * Math.cos(c) * Math.pow(Math.sin((b - d) / 2), 2)));
  //   dist = e * rayon * 2;

  //   return {
  //     'distance': this.convertMeterToDistance(dist),
  //     'time': this.convertMeterToTime(dist)
  //   };
  // };

  // convertMeterToDistance = (meter) => {
  //   if (meter < 1000) {
  //     return meter.toFixed(0) + 'm';
  //   } else {
  //     const toKM = meter / 1000;
  //     return toKM.toFixed(0) + 'km';
  //   }
  // };

  // /**
  //  * La durée est calculée par : 1mètre = 1minute
  //  * @param meter
  //  */
  // convertMeterToTime = (meter) => {
  //   meter = meter.toFixed(0);
  //   const meterToMinute = meter / 100;

  //   if (meterToMinute < 60) {
  //     return meterToMinute.toFixed(0) + 'm';
  //   } else {
  //     const meterToKM = meterToMinute / 60;

  //     return meterToKM.toFixed(0) + 'h';
  //   }
  // };

  // /**
  //  * Construction de la chaîne de caractère de la distance et de la durée jusqu'au
  //  * premier point d'intérêt.
  //  * EX ouput : "à 546m (5m)"
  //  */
  // calculGeoLocDistance() {
  //   const distancePrefix = this.translate.get('PLI_DISTANCE_PREFIX');
  //   const res = this.getDistance(this.getClosetLandmarkGeolocFromParcours(), this.curPositionUser);

  //   this.timeToObj = `${distancePrefix} ${res.distance}`;
  // }


  // /**
  //  * Retourne les coordonées GPS du point d'intérêt le plus proche
  //  * d'un parcours.
  //  * @param parcoursId
  //  * @returns {any}
  //  */
  // getClosetLandmarkGeolocFromParcours() {
  //   if (this.placesList.length === 0) {
  //     return null;
  //   } else {
  //     return this.placesList[0].geoloc;
  //   }
  // }

}
