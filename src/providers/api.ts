import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ApiProvider {
  endpoint_data: string = '';
  endpoint_assets: string = '';

  constructor(private http: HttpClient) {
    this._init();
  }

  _init() {
    this.loadApiUrl()
      .then(res =>{
        console.log(res);
        console.log(this.endpoint_data);
      })
      .catch(err =>  {
        console.log('err', err);
      })
  }

  loadApiUrl() {
    return new Promise((resolve, reject) => {
      this.http.get('manifest.json').subscribe((resp: any) => {
        this.endpoint_data = resp.endpoint_data;
        this.endpoint_assets = resp.endpoint_assets;
        resolve('resolved');
      }, err => {
        reject('rejected');
      });
    });
  }

  get(target: string) {
    return this.http.get(this.endpoint_data + target);
  }

  getAssetsUri(target: string) {
    return this.endpoint_assets + target;
  }

  getRequestURI(target: string) {
    return this.endpoint_data + target;
  }

}
