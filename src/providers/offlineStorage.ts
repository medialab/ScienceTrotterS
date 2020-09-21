import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class OfflineStorageProvider {

  constructor(
    private storage: Storage
  ) {}
  getRequest(url: string) {
    return this.storage.get(url)
  }
}