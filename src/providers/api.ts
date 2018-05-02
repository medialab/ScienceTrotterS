import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ApiProvider {
  endpoint: string = 'http://api-sts.actu.com';

  constructor(private http: HttpClient) {
    this._init();
  }
  _init() {
    this.http.get('/manifest.json').subscribe(res => {
      this.endpoint = res.endpoint;
    }, err => {
      // Handle manifest file not found.
    });
  }

  get(target: string) {
    return this.http.get(this.endpoint + target);
  }
}
