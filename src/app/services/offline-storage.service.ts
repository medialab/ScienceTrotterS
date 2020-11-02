import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import { set, get } from 'lodash'
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class OfflineStorageService {

  // downloaded: BehaviorSubject<{}> = new BehaviorSubject({});
  downloaded: object = {};
  visited: object = {};

  constructor(
    private storage: Storage,
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

  isDownloaded(cityId: string, target: string, id: string) {
    return get(this.downloaded, [cityId, target, id], false)
  }

  updateDownloaded(city: any, target: string, item: any, isDownloaded: boolean) {
    // const downloaded = this.downloaded.getValue()
    if(!this.downloaded[city.id] && isDownloaded) {
      this.downloaded[city.id] = city;
    }
    if(isDownloaded) {
      set(this.downloaded, [city.id, target, item.id], item);
    } else {
      delete this.downloaded[city.id][target][item.id];
    }
    this.storage.set('downloaded', this.downloaded)
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
        // this.downloaded.next({});
        this.downloaded = {};
        resolve();
      })
      .catch((err) => reject(err));
    })
  }

  // public alertStorageWarning() {
  //   if ('storage' in navigator && 'estimate' in navigator["storage"]) {
  //     navigator["storage"].estimate().then(({usage, quota}) => {
  //       const spaceInMb = Math.round(quota / (1024 * 1024)) - Math.round(usage / (1024 * 1024));

  //       const details = `Only ${spaceInMb} MB left. `;
  //       const title = this.translate.getKey('ALERT_STORAGE_WARNING_TITLE');
  //       const message = details + this.translate.getKey('ALERT_STORAGE_WARNING_MSG');

  //       this.alert.create(
  //         title,
  //         message
  //       );
  //     });
  //   }
  // }
}
