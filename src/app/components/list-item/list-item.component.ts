import { OfflineStorageService } from './../../services/offline-storage.service';
import { LoadingController } from '@ionic/angular';
import { ApiService } from './../../services/api.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from './../../services/config.service';
import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { getDistance } from 'src/app/utils/helper';
import { NavigationExtras, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
})
export class ListItemComponent implements OnInit, OnChanges {
  @Input() target: string = '';
  @Input() focusId: string = 'focusId';
  @Input() item: any;
  @Input() parcourTime: string = '';
  @Input() createdAt: string = '';
  @Input() geoloc: any = undefined;
  @Input() curPositionUser: any = undefined;
  @Input() selectedItemId: any = undefined;
  @Input() sortOrder: any = null;
  @Input() placesList: Array < any > = [];
  @Input() cityName: string = '';
  @Input() cityId: string = '';

  @Output() selectListItem = new EventEmitter<any>();

  isItemDownloadable: boolean = true;

  isShowTimeToObj: boolean = false;
  timeToObj = '';

  isOpenDiscover: boolean = false;
  parcourAudioUrl: string = null;
  offlineAudioUrl: string = null;

  constructor(
    public translate: TranslateService,
    public api: ApiService,
    private router: Router,
    public sanitizer: DomSanitizer,
    private offlineStorage: OfflineStorageService,
    private loader: LoadingController,
    public config: ConfigService
  ) {
  }

  ngOnInit() {
    this.parcourAudioUrl = this.api.getAssetsUri(this.item['audio'][this.translate.currentLang]);
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

  selectItem() {
    if (this.target === 'parcours') {
      this.isOpenDiscover = !this.isOpenDiscover;
      this.loadAudioUrl();
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

  loadAudioUrl() {
    if (this.isDownloaded()) {
      this.offlineStorage.getRequest(this.parcourAudioUrl)
      .then((blob) => {
        this.offlineAudioUrl = ((window as any).URL ? (window as any).URL : (window as any).webkitURL).createObjectURL(blob);
      })
    }
  }

  /**
   * Construction de la chaîne de caractère de la distance et de la durée jusqu'au
   * premier point d'intérêt.
   * EX ouput : "à 546m (5m)"
   */
  calculGeoLocDistance() {
    const closestLandmark = this.placesList.length && this.placesList[0].geoloc || null;
    if (closestLandmark) {
      const res = getDistance(closestLandmark, this.curPositionUser);
      this.timeToObj = `${res.distance}`;
    }
  }

  async downloadItem() {
    if (this.isDownloaded()) return;
    // show loader
    let loading = await this.loader.create({
      // content : this.translate.getKey('PLI_ACTION_DOWNLOAD_DATA_LOADER')
      backdropDismiss: true
    });
    loading.present();

    if (this.target === 'parcours') {
      const audioUrl = this.api.getAssetsUri(this.item['audio'][this.translate.currentLang]);
      const audioFile = await this.api.getFile(audioUrl);
      const audioDownload = await this.offlineStorage.setRequest(audioUrl, audioFile);
      const placesDownload = this.placesList.map(async (place) => await this.downloadPlace(place));
      await Promise.all([audioDownload, placesDownload]);
      this.offlineStorage.updateDownloaded(this.cityId, 'parcours', this.item.id, true);
    }
    if (this.target === 'places') {
      await this.downloadPlace(this.item);
    }
    loading.dismiss();
  }

  async downloadPlace(place) {
    //Téléchargement de la cover
    const coverUrl = this.api.getAssetsUri(place['header_image']);

    // Téléchargement de l'audio
    const audioUrl = this.api.getAssetsUri(place['audio'][this.translate.currentLang]);

    // Téléchargement des images de la galerie pour ce POI
    const gallery = Object.keys(place['gallery_image'])
          .map((key, i) =>  {
            return this.api.getAssetsUri(place['gallery_image'][key]);
          });

    const downloads = [coverUrl, audioUrl, ...gallery].map(async (url) => {
      const response = await this.api.getFile(url);
      return this.offlineStorage.setRequest(url, response);
    });

    await Promise.all(downloads);
    this.offlineStorage.updateDownloaded(this.cityId, 'places', place.id, true);
    return downloads;
  }

  isVisited() {
    return this.offlineStorage.isVisited(this.cityId, this.target, this.item.id)
  }

  isDownloaded() {
    return this.offlineStorage.isDownloaded(this.cityId, this.target, this.item.id)
  }
}
