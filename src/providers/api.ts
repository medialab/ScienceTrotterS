import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {CacheService} from "ionic-cache";

@Injectable()
export class ApiProvider {
  endpoint_data: string = '';
  endpoint_assets: string = '';

  /**
   * Cache configuration.
   * @type {{ttl: number; delayType: string}}
   */
  requestConfig = {
    'ttl': 5,
    'delayType': 'all'
  };

  constructor(private http: HttpClient,
              private cache: CacheService) {
    this._init();
  }

  /**
   *
   * @private
   */
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

  /**
   *
   * @returns {Promise<T>}
   */
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

  /**
   * Traite une requête HTTP /GET.
   *
   * @param target - Une route valide de l'api.
   * @param withCache - True ou false pour le traitement via cache.
   * @returns {Observable<Object>}
   */
  get(target: string, withCache = true) {
    const httpURI = this.getRequestURI(target);
    const request = this.http.get(httpURI);
    return withCache ? this.getRequestAsCache(httpURI, request, target) : request;
  }
  
  /**
   * Middlleware d'une requête HTTP pour la gestion du cache.
   *
   * @param httpURI - L'url finale vers l'api.
   * @var request - La requête HTTP.
   * @param target - Une route valide de l'api.
   * @returns {Observable<T>}
   */
  getRequestAsCache(httpURI: string, request: any, target: string) {
    return this.cache.loadFromDelayedObservable(httpURI, request, target,
      this.requestConfig.ttl, this.requestConfig.delayType);
  }

  /**
   * Construit une url vers un asset.
   *
   * @param target - un asset.
   * @returns {string}
   */
  getAssetsUri(target: string) {
    return this.endpoint_assets + target;
  }

  /**
   * Construit une url vers un route de l'api.
   *
   * @param target - Une route valide de l'api.
   * @returns {string}
   */
  getRequestURI(target: string) {
    return this.endpoint_data + target;
  }
}
