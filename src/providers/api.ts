import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ApiProvider {
  endpoint: string = '';

  constructor(private http: HttpClient) {
    this._init();
  }

  _init() {
    this.loadApiUrl()
      .then(res =>{
        console.log(res);
        console.log(this.endpoint);
      })
      .catch(err =>  {
        console.log('err', err);
      })
  }

  loadApiUrl() {
    return new Promise((resolve, reject) => {
      this.http.get('manifest.json').subscribe((resp: any) => {
        this.endpoint = resp.endpoint;
        resolve('resolved');}, err => {

        reject('rejected)');
      });
    });
  }

  get(target: string) {
    return this.http.get(this.endpoint + target);
  }

}
