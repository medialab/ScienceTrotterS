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
  isEdit: boolean = false;
  isSelectAll: boolean = false;
  deleteList: any = [];
  isShowToast: boolean = false;
  toast: any = null;

  constructor(
    private offlineStorage: OfflineStorageService,
    private toastCtrl: ToastController,
    private loader: LoadingController,
    private api: ApiService,
    public translate: TranslateService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.initDownloaded()
  }

  initDownloaded() {
    this.downloaded = {...this.offlineStorage.getDownloaded()};
    this.cities = Object.values(this.downloaded);
    this.cities.forEach((city) => {
      this.downloaded[city.id] = {
        ...this.downloaded[city.id],
        list: this.getDownloadList(city)
      }
    });
    this.downloadedList = this.cities.reduce((init, city) => {
      return init.concat(this.downloaded[city.id].list);
    }, []);
  }

  toggleEdit() {
    this.isEdit = !this.isEdit;
    if(!this.isEdit) {
      this.isShowToast = false;
      this.isSelectAll = false;
      if(this.toast) {
        this.toast.dismiss();
      }
    }
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

  async presentDeleteToast() {
    const deleteList = this.cities.reduce((init, city) => {
      const deleted = this.downloaded[city.id].list.filter((item) => item.isChecked)
      return init.concat(deleted);
    }, []);

    if(deleteList.length === 0 && this.isShowToast) {
      this.isShowToast = false;
      this.toast.dismiss();
    } else if (!this.isShowToast) {
      this.isShowToast = true;
      this.toast = await this.toastCtrl.create({
        message: `Delete ${deleteList.length + 1} items`,
        buttons: [
          {
            side: 'end',
            icon: 'trash-outline',
            text: 'Delete',
            handler: () => {
              this.clearList(deleteList);
              this.toggleEdit();
            }
          }, {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              this.toggleEdit();
            }
          }
        ]
      });
      this.toast.present();
    }
  }

  async clearList(list) {
    let loading = await this.loader.create({
      // content : this.translate.getKey('PLI_ACTION_DOWNLOAD_DATA_LOADER')
      backdropDismiss: true
    });
    loading.present();
    const deletes = list.map(async (item) => {
      if(item.type === 'places') return await this.deletePlace(item);
      if(item.type === 'parcours') return await this.deleteParcour(item);
    });
    await Promise.all(deletes);
    loading.dismiss();
    this.initDownloaded();
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

  toggleCheck(event, id, cityId, type) {
    this.presentDeleteToast()
  }

  toggleSelectAll() {
    this.isSelectAll = !this.isSelectAll;
    this.cities.forEach((city: any) => {
      this.downloaded[city.id].list.forEach((item: any) => item.isChecked = this.isSelectAll);
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
