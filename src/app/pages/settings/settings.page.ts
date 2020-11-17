import { OfflineStorageService } from './../../services/offline-storage.service';
import { ClearanceModalComponent } from './../../components/clearance-modal/clearance-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { ConfigService } from './../../services/config.service';
import { ModalController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  isEnglish = false;

  constructor(
    public translate: TranslateService,
    private modalController: ModalController,
    private offlineStorage: OfflineStorageService,
    private loader: LoadingController,
    public config: ConfigService
    ) {
      this.isEnglish = this.translate.currentLang === 'en';
    }

  ngOnInit() {
  }

  /**
  * Mise a jour de la langue à la modification de l'état du toggle.
  */
  updateLanguage() {
    const language = this.isEnglish ? 'en':'fr';
    localStorage.setItem('config::locale', language);
    this.translate.use(language);
  }

  /**
  * Mise a jour du thème à la modification de l'état du toggle.
  */
  updateTheme() {
  }

  getDownloadList (city) {
    return Object.values(city['parcours'] || [])
                .concat(Object.values(city['places']) || [])

  }

  async clearCache() {
    let loading = await this.loader.create({
      // content : this.translate.getKey('PLI_ACTION_DOWNLOAD_DATA_LOADER')
      backdropDismiss: true
    });
    loading.present();

    // case 1: no entry stored in downloads
    const offlineDownloaded = this.offlineStorage.getDownloaded();
    let isSomeDownloads = false;
    ['fr', 'en'].forEach((lang) => {
      if (offlineDownloaded[lang]) {
        const cities = Object.values(offlineDownloaded[lang]);
        cities.forEach((city: any) => {
          const list = Object.values(city['parcours'] || []).concat(Object.values(city['places']) || [])
          if (list.length > 0) {
            isSomeDownloads = true;
            return;
          }
        });
      }
    });
    // case 2: no blob requests are stored
    const blobs:any = await this.offlineStorage.getAllBlobs();

    if (!isSomeDownloads || blobs.length === 0) {
      await this.offlineStorage.clearAll();
    } else {
      await this.offlineStorage.clearVisited();
    }
    loading.dismiss();
  }

  async showClearanceModal() {
    const modal = await this.modalController.create({
      component: ClearanceModalComponent,
      swipeToClose: true,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }
}
