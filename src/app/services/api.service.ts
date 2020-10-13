import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CacheService } from 'ionic-cache';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  apiUrl = environment.endpoint.data
  assetsUrl = environment.endpoint.assets

  constructor(
    private http: HttpClient,
    private cache: CacheService
  ) {}

  /**
   * Traite une requête HTTP /GET.
   *
   * @param target - Une route valide de l'api.
   * @param withCache - True ou false pour le traitement via cache.
   * @returns {Observable<Object>}
   */
  get(target: string, withCache = true) {
    const requestUri = this.getRequestUri(target);
    const request = this.http.get(requestUri);
    return request;
    // return withCache ? this.getRequestAsCache(httpURI, request, target) : request;
  }

  /**
   * get image/audio blob from server.
   *
   * @param url
   * @returns {Observable<T>}
   */

  getFile(url: string) {
    return this.http.get(url,{ responseType: 'blob' })
  }


  /**
   * Construit une url vers un asset.
   *
   * @param target - un asset.
   * @returns {string}
   */
  getAssetsUri(target: string) {
    return this.assetsUrl + target;
  }

  /**
   * Construit une url vers un route de l'api.
   *
   * @param target - Une route valide de l'api.
   * @returns {string}
   */
  getRequestUri(target: string) {
    return this.apiUrl + target;
  }
}
