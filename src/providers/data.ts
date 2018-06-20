import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class DataProvider {
  // TODO : Cache.
  cities: Array<any> = new Array();
}
