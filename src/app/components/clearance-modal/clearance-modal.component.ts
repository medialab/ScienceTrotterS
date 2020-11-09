import { ConfigService } from './../../services/config.service';
import { ApiService } from './../../services/api.service';
import { TranslateService } from '@ngx-translate/core';
import { OfflineStorageService } from './../../services/offline-storage.service';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-clearance-modal',
  templateUrl: './clearance-modal.component.html',
  styleUrls: ['./clearance-modal.component.scss'],
})
export class ClearanceModalComponent implements OnInit {
  downloadedList: any;
  downloaded: any;
  cities: any;
  deleteList: any = [];
  toast: any = null;

  constructor(
    private offlineStorage: OfflineStorageService,
    private toastCtrl: ToastController,
    private loader: LoadingController,
    private api: ApiService,
    public config: ConfigService,
    public translate: TranslateService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.initDownloaded()
  }

  async initDownloaded() {
    const citiesAvailable = await this.api.get('/public/cities/list?lang=' + this.translate.currentLang);

    this.downloaded = {...this.offlineStorage.getDownloaded()};

    this.cities = Object.values(this.downloaded).filter((city: any) => {
      return citiesAvailable.findIndex((c) => c.id === city.id) > -1
    });
    this.cities.forEach((city) => {
      this.downloaded[city.id] = {
        ...this.downloaded[city.id],
        list: this.getDownloadList(city),
        parcoursList: city.parcours ? this.getList(city.parcours) : [],
        placesList: city.places ? this.getList(city.places) : [],
      }
    });
    this.downloadedList = this.cities.reduce((init, city) => {
      return init.concat(this.downloaded[city.id].list);
    }, []);
  }

  getDownloadList(city) {
    const list = Object.values(city['parcours'] || [])
                .concat(Object.values(city['places']) || [])
                .map((item: any) => {
                  return {
                    ...item,
                    isChecked: false
                  };
                })
    return list;
  }

  getList(data) {
    const list = Object.values(data).map((item: any) => {
      return {
        ...item,
        isChecked: false
      };
    });
    return list;
  }

  presentDeleteToast() {
    this.deleteList = this.cities.reduce((init, city) => {
      const deleted = this.downloaded[city.id].parcoursList.filter((item) => item.isChecked)
                      .concat(this.downloaded[city.id].placesList.filter((item) => item.isChecked))
      return init.concat(deleted);
    }, []);
  }

  cancelDelete() {
    this.deleteList = [];
    this.cities.forEach((city: any) => {
      this.downloaded[city.id].placesList.forEach((item: any) => item.isChecked = false);
      this.downloaded[city.id].parcoursList.forEach((item: any) => item.isChecked = false);
    });
  }

  async clearList() {
    let loading = await this.loader.create({
      // content : this.translate.getKey('PLI_ACTION_DOWNLOAD_DATA_LOADER')
      backdropDismiss: true
    });
    loading.present();
    const deletes = this.deleteList.map(async (item) => {
      if(item.type === 'places') return await this.deletePlace(item);
      if(item.type === 'parcours') return await this.deleteParcour(item);
    });
    await Promise.all(deletes);
    loading.dismiss();
    this.initDownloaded();
  }

  async clearCache() {
    let loading = await this.loader.create({
      // content : this.translate.getKey('PLI_ACTION_DOWNLOAD_DATA_LOADER')
      backdropDismiss: true
    });
    loading.present();
    await this.offlineStorage.clearAll();
    loading.dismiss();
  }


  async deletePlace(place) {
    const coverUrl = this.api.getAssetsUri(place['header_image']);
    const audioUrl = this.api.getAssetsUri(place['audio'][this.translate.currentLang]);
    const gallery = Object.keys(place['gallery_image'])
          .map((key, i) =>  {
            return this.api.getAssetsUri(place['gallery_image'][key]);
          });

    const deletes = [coverUrl, audioUrl, ...gallery].map(async (url) => {
      return await this.offlineStorage.clearRequest(url);
    });

    const update = await this.offlineStorage.updateDownloaded(
      { id: place['cities_id']},
      'places',
      { id: place.id },
      false);
    await Promise.all([deletes, update]);

  }

  async deleteParcour(parcour) {
    const audioUrl = this.api.getAssetsUri(parcour['audio'][this.translate.currentLang]);
    const audioDelete = await this.offlineStorage.clearRequest(audioUrl);
    const placesDelete = parcour.placesList.map(async (place) => await this.deletePlace(place));
    const update = await this.offlineStorage.updateDownloaded(
      { id: parcour['cities_id']},
      'parcours',
      { id: parcour.id },
      false);
    await Promise.all([audioDelete, placesDelete, update]);

  }

  toggleCheck(event, type, cityId, item) {
    if(type === 'parcours') {
      this.downloaded[cityId].placesList.forEach((place) => {
        if(place.parcours_id === item.id) place.isChecked = event.detail.checked;
      })
    }
    if(type === 'places') {
      const placesListChecked = this.downloaded[cityId].placesList.filter((place) => place.parcours_id === item.parcours_id && place.isChecked);
      const parcourIndex = this.downloaded[cityId].parcoursList && this.downloaded[cityId].parcoursList.findIndex((parcour) => parcour.id === item.parcours_id);
      if (parcourIndex === -1) return;
      if(event.detail.checked) {
        if (placesListChecked.length === this.downloaded[cityId].parcours[item.parcours_id].placesList.length) {
          this.downloaded[cityId].parcoursList[parcourIndex].isChecked = true;
        }
      } else {
        if(placesListChecked.length === 0) {
          this.downloaded[cityId].parcoursList[parcourIndex].isChecked = false;
        }
      }
    }
    this.presentDeleteToast()
  }

  toggleSelectAll(event) {
    this.cities.forEach((city: any) => {
      this.downloaded[city.id].placesList.forEach((item: any) => item.isChecked = event.detail.checked);
      this.downloaded[city.id].parcoursList.forEach((item: any) => item.isChecked = event.detail.checked);
    });
    this.presentDeleteToast();
  }
  dismissModal() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }
}
