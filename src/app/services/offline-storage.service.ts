import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import { set, get } from 'lodash'
import { Storage } from '@ionic/storage';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OfflineStorageService {

  // downloaded: BehaviorSubject<{}> = new BehaviorSubject({});
  downloaded: object = {};
  visited: object = {};

  assetsUrl = environment.endpoint.assets

  constructor(
    private storage: Storage,
    private translate: TranslateService,
    private alertCtrl: AlertController
  ) {
    this.initDownloaded();
    this.initVisited();
  }

  initVisited() {
    this.storage.get("visited").then((res) => {
      if(res) {
        this.visited = res;
      }
    })
  }

  isVisited(city: string, target: string, id: string) {
    return get(this.visited, [city, target, id], false)
  }

  updateVisited(city: string, target: string, id: string, isVisited: boolean) {
    // const visited = this.visited.getValue();
    set(this.visited, [city, target, id], isVisited);
    this.storage.set('visited', this.visited);
  }

  clearVisited() {
    this.visited = {};
    this.storage.set('visited', {});
  }

  initDownloaded() {
    this.storage.get('downloaded').then((res) => {
      if(res) {
        this.downloaded = res;
      }
    })
  }

  getDownloaded() {
    return this.downloaded;
    // return this.downloaded.asObservable()
  }

  isDownloaded(lang:string, cityId: string, target: string, id: string) {
    return get(this.downloaded, [lang, cityId, target, id], false);
  }

  updateDownloaded(lang: string, city: any, target: string, item: any, isDownloaded: boolean) {
    // const downloaded = this.downloaded.getValue()
    if(isDownloaded) {
      if(!this.downloaded[lang] || !this.downloaded[lang][city.id]) {
        set(this.downloaded,[lang, city.id], city);
      }
      set(this.downloaded, [lang, city.id, target, item.id], item);
    } else {
      delete this.downloaded[lang][city.id][target][item.id];
    }
    return this.storage.set('downloaded', this.downloaded)
    // this.downloaded.next(downloaded)
  }

  getRequest(url: string) {
    return this.storage.get(url)
  }

  setRequest(url: string, blob: Blob) {
    return this.storage.set(url, blob)
  }

  clearRequest(url: string) {
    return this.storage.remove(url);
  }

  clearAll() {
    return new Promise((resolve, reject) => {
      this.storage.forEach((value, key) => {
        this.storage.remove(key);
      })
      .then(() => {
        this.downloaded = {};
        this.visited = {}
        resolve();
      })
      .catch((err) => reject(err));
    })
  }

  getAllBlobs () {
    let blobs = [];
    return new Promise((resolve, reject) => {
      this.storage.forEach((value, key: string) => { if(key.includes(this.assetsUrl)) blobs.push(key)})
      .then(() => resolve(blobs))
    })
  }

  async alertStorageWarning() {
    if ('storage' in navigator && 'estimate' in navigator["storage"]) {
      navigator["storage"].estimate().then(async ({usage, quota}) => {
        const spaceInMb = Math.round(quota / (1024 * 1024)) - Math.round(usage / (1024 * 1024));
        this.translate.get(['ALERT_STORAGE_WARNING_TITLE', 'ALERT_STORAGE_WARNING_MSG'], {spaceLeft: spaceInMb})
        .subscribe(async (resp) => {
          const alert = await this.alertCtrl.create({
            header: resp['ALERT_STORAGE_WARNING_TITLE'],
            message: resp['ALERT_STORAGE_WARNING_MSG'],
            buttons: ['OK']
          });
          await alert.present();
        })

      });
    }
  }
}
