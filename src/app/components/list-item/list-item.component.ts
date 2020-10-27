import { AudioPlayerComponent } from './../audio-player/audio-player.component';
import { ApiService } from './../../services/api.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from './../../services/config.service';
import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { getDistance } from 'src/app/utils/helper';
import { NavigationExtras, Router } from '@angular/router';

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
  @Input() isVisited: boolean = false;
  @Input() isDownloaded: boolean = false;

  @Output() selectListItem = new EventEmitter<any>();

  @ViewChild(AudioPlayerComponent) audioPlayer:AudioPlayerComponent;

  isItemDownloadable: boolean = true;

  isShowTimeToObj: boolean = false;
  timeToObj = '';

  isOpenDiscover: boolean = false;
  constructor(
    public translate: TranslateService,
    public api: ApiService,
    private router: Router,
    public config: ConfigService
  ) {}

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (typeof this.geoloc !== 'undefined' && this.curPositionUser.longitude !== '' && this.curPositionUser.latitude !== '') {
      this.isShowTimeToObj = true;
      this.calculGeoLocDistance();
    } else {
      this.isShowTimeToObj = false;
    }

    if (changes["selectedItemId"]) {
      this.isOpenDiscover = this.selectedItemId === this.item.id;
    }
  }

  componentWillLeave() {
    if (this.audioPlayer) {
      this.audioPlayer.forcePause();
    }
  }

  selectItem() {
    if (this.target === 'parcours') {
      this.isOpenDiscover = !this.isOpenDiscover;
    } else {
      this.router.navigate([`/place/${this.item.id}`]);
    }
  }

  startParcour() {
    let navigationExtras: NavigationExtras = {
      state: {
        parcour: this.item,
        placesList: this.placesList
      }
    };
    this.router.navigate([`/place/${this.placesList[0].id}`], navigationExtras);
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
