import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject, Observable } from 'rxjs';
import { set, get } from 'lodash'

@Injectable()
export class OfflineStorageProvider {
  private downloaded: BehaviorSubject<{}> = new BehaviorSubject({});

  constructor(
    private storage: Storage
  ) {
    this.initDownloaded()
  }

  initDownloaded() {
    this.storage.get('downloaded').then((res) => {
      if(res) {
        this.downloaded.next(res)
      }
    })
  }

  getDownloaded() {
    return this.downloaded.asObservable()
  }

  isDownloaded(city: string, target: string, id: string) {
    return get(this.downloaded.getValue(), [city, target, id], false)
  }

  updateDownloaded(city: string, target: string, id: string, isDownladed: boolean) {
    const downloaded = this.downloaded.getValue()
    set(downloaded, [city, target, id], isDownladed)
    this.downloaded.next(downloaded)
    this.storage.set('downloaded', downloaded)
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
}