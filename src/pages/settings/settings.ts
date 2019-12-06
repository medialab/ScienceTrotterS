import { LoadingController, Loading } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {TranslateProvider} from "../../providers/translate";
import {ConfigProvider} from "../../providers/config";
import { normalizeURL} from '../../../node_modules/ionic-angular/util/util';
import { UrlSerializer } from '../../../node_modules/ionic-angular/navigation/url-serializer';


@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})

export class SettingsPage {
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public config: ConfigProvider,
              public translate: TranslateProvider,
              public file : File,
              public loader : LoadingController) {

  }

  /**
   * Mise a jour de la langue à la modification de l'état du toggle.
   */
  updateLanguage() {
    this.config.updateLanguage();
  }

  /**
   * Mise a jour de la taille de la police.
   */
  updateFontSize() {
    this.config.updateFontSize();
  }

  /**
   * Mise a jour du thème à la modification de l'état du toggle.
   */
  updateTheme() {
    this.config.updateTheme();
  }

  deleteMedia(){

    let loading = this.loader.create({
      content : this.translate.getKey('P_SETTING_DELETE_LOADER')
    });

    loading.present();
    if (this.file && this.file.dataDirectory) {
      // only if mobile empty downloaded files
      var sPath = this.file.dataDirectory.replace( /(.+)\/(\w+)/, "$1" );
      var sDirectory = this.file.dataDirectory.replace( /(.+)\/(\w+)/, "$2" );

      
      this.file.removeRecursively( sPath  ,  sDirectory)
      .catch(err =>{
        console.log(err);
      });
    }
    localStorage.setItem('POI', "{}");
    localStorage.setItem('Parcours', '{}');
    localStorage.setItem('sts::statusPOI', '{}');
    // reset vu to à voir items

    loading.dismiss();
  }

  goBack() {
    this.navCtrl.pop();
  }
}

