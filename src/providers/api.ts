import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {CacheService} from "ionic-cache";
import {ConfigProvider} from "./config";

@Injectable()
export class ApiProvider {
  /**
   * Cache configuration.
   * @type {{ttl: number; delayType: string}}
   */
  requestConfig = {
    'ttl': 5,
    'delayType': 'all'
  };

  constructor(public config: ConfigProvider,
              private http: HttpClient,
              private cache: CacheService) {
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
   * get image/audio blob from server.
   *
   * @param url
   * @returns {Observable<T>}
   */

  getFile(url: string) {
    return this.http.get(url,{ responseType: 'blob' })
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
    return this.config.data.endpoint.assets + target;
  }

  /**
   * Construit une url vers un route de l'api.
   *
   * @param target - Une route valide de l'api.
   * @returns {string}
   */
  getRequestURI(target: string) {
    return this.config.data.endpoint.data + target;
  }
}
