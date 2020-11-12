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


  async clearCache() {
    let loading = await this.loader.create({
      // content : this.translate.getKey('PLI_ACTION_DOWNLOAD_DATA_LOADER')
      backdropDismiss: true
    });
    loading.present();
    await this.offlineStorage.clearVisited();
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
