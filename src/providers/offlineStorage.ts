import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject, Observable } from 'rxjs';
import { set } from 'lodash'

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

  updateDownloaded(city: string, target: string, id: string) {
    const downloaded = this.downloaded.getValue()
    set(downloaded, [city, target, id], true)
    this.downloaded.next(downloaded)
    this.storage.set('downloaded', downloaded)
  }

  getRequest(url: string) {
    return this.storage.get(url)
  }

  setRequest(url: string, blob: Blob) {
    return this.storage.set(url, blob)
  }
}