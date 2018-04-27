import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ApiProvider {
  base: string = 'http://api-sts.actu.com';

  constructor(private http: HttpClient) {
    console.log('Hello ApiProvider Provider');
  }

  get(endpoint: string) {
    return this.http.get(this.base + endpoint);
  }
}
