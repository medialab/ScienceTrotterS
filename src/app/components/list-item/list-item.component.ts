import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from './../../services/config.service';
import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { getDistance } from 'src/app/utils/helper';
import { Router } from '@angular/router';

@Component({
  selector: 'list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
})
export class ListItemComponent implements OnInit, OnChanges {
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
  @Input() selectedItemId: any = undefined;
  @Input() sortOrder: any = null;
  @Input() placesList: Array < any > = [];
  @Input() cityName: string = '';
  @Input() cityId: string = '';
  @Input() isDownloaded: boolean = false;

  @Output() selectListItem = new EventEmitter<any>();

  isItemDownloadable: boolean = true;

  isShowTimeToObj: boolean = false;
  timeToObj = '';

  isOpenDiscover: boolean = false;
  constructor(
    private translate: TranslateService,
    private router: Router,
    private config: ConfigService
  ) {}

  ngOnInit() {
  }

  ngOnChanges() {
    if (typeof this.geoloc !== 'undefined' && this.curPositionUser.longitude !== '' && this.curPositionUser.latitude !== '') {
      this.isShowTimeToObj = true;
      this.calculGeoLocDistance();
    } else {
      this.isShowTimeToObj = false;
    }

    if (this.selectedItemId && this.selectedItemId === this.item.id) {
      console.log("select")
      this.selectItem();
    }
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

  selectItem() {
    if (this.target === 'parcours') {
      this.isOpenDiscover = !this.isOpenDiscover;
      // this.selectListItem.emit(this.item);
    } else {
      this.router.navigate([`/place/${this.item.id}`]);
    }
  }

  navigateToPlace() {
    this.router.navigate([`/place/${this.placesList[0].id}`])
  }

  /**
   * Construction de la chaîne de caractère de la distance et de la durée jusqu'au
   * premier point d'intérêt.
   * EX ouput : "à 546m (5m)"
   */
  calculGeoLocDistance() {
    const closestLandmark = this.placesList.length && this.placesList[0].geoloc || null;
    const res = getDistance(closestLandmark, this.curPositionUser);
    this.timeToObj = `${res.distance}`;
  }

  downloadItem() {
    console.log('download')
  }
}
