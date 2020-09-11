import { Injectable } from '@angular/core';
import {Platform} from "ionic-angular";
import {Network} from "@ionic-native/network";
import {
  normalizeURL
} from '../../node_modules/ionic-angular/util/util';

@Injectable()
export class LocalDataProvider {

  constructor(public platform: Platform,
              public network: Network) {
  }

  /**
   * Ajout d'une donnée au localStorage.
   * @param key
   * @param value
   */
  add (key: string, value: string) {
    localStorage.setItem(key, value);
  }

  /**
   * Récupèration d'une donnée du localStorage.
   * @param key
   * @returns {string|null}
   */
  get (key: string) {
    return localStorage.getItem(key);
  }

  /**
   * Ajout d'une donnée au localStorage à partir d'un array
   * qui sera transformé en chaîne de caractère au préalable.
   * @param key
   * @param value
   */
  addAsArray (key: string, value: any) {
    this.add(key, JSON.stringify(value));
  }

  /**
   * Récupèration d'une donnée du localStorage
   * sous forme d'un object.
   * @param key
   * @returns {any}
   */
  getAsObject (key: string) {
    let data: any = this.get(key);

    if (data === null) {
      return {};
    } else {
      return JSON.parse(data);
    }
  }

  /**
   * Récupèration d'une donnée du localStorage
   * sous forme d'un tableau.
   * @param key
   * @returns {any}
   */
  getAsArray (key: string) {
    let data: any = this.get(key);

    if (data === null) {
      return [];
    } else {
      return JSON.parse(data);
    }
  }

  /**
   * Ajout d'un parcours à la liste de ceux complétés.
   * @param uuid
   * @param language
   * @returns {any}
   */
  addParcoursDone ({uuid, created_at}, language: string) {
    const key = 'sts::statusParcours';
    let data: any = this.getAsObject(key);

    if (typeof data[language] !== 'undefined') {
      const itemId = data[language].findIndex(i => i.uuid === uuid);

      if (itemId === -1) {
        // SAVE DU PARCOURS.
        data[language].push({
          'uuid': uuid,
          'created_at': created_at
        });
      } else {
        // MAJ DU PARCOURS
        data[language][itemId] = {
          'uuid': uuid,
          'created_at': created_at
        };
      }

    } else {
      data[language] = [];
      data[language].push({
        'uuid': uuid,
        'created_at': created_at
      });
    }

    this.addAsArray(key, data);
    return data;
  }

  /**
   * Vérifie si un parcours est complété.
   * @param uuid
   * @param language
   * @returns {boolean}
   */
  isParcoursIsDone ({uuid, created_at}, language: string) {
    const key = 'sts::statusParcours';
    let data = this.getAsArray(key);

    if (typeof data[language] === 'undefined') {
      return false;
    } else {
      const itemId = data[language].findIndex(i => i.uuid === uuid);

      if (itemId === -1) {
        return false;
      } else {
        if (data[language][itemId].created_at === created_at) {
          return true;
        } else {
          data[language].splice(itemId, 1);
          this.addAsArray(key, data);
          return false;
        }
      }
    }
  }

  /**
   * Ajout d'un point d'intérêt ) la liste de ceux complétés.
   * @param uuid
   * @param language
   * @returns {any}
   */
  updatePOIDone ({uuid, created_at, done}, language: string) {
    const key = 'sts::statusPOI';
    let data: any = this.getAsObject(key);

    if (typeof data[language] === 'undefined') {
      data[language] = [];
    }
    // look for the POI
    const itemIndex = data[language].findIndex(o => o && o.uuid === uuid)
    if (itemIndex === -1) {
      // not found
      if (done) {
        // SAVE DU POI.
        data[language].push({
          'uuid': uuid,
          'created_at': created_at
        });
      }
    } else {
      // found
      if (done) {
        // MAJ DU POI
        data[language][itemIndex] = {
          'uuid': uuid,
          'created_at': created_at
        };
      }
      else {
        data[language] = data[language].filter(i => i && i.uuid !== uuid)
      }
    }
    this.addAsArray(key, data);
    return data;
  }

  /**
   * Vérifie si un point d'intérêt est complété.
   * @param uuid
   * @param language
   * @returns {boolean}
   */
  isPOIIsDone ({uuid, created_at}, language: string) {
    const key = 'sts::statusPOI';
    let data = this.getAsObject(key);

    if (typeof data[language] === 'undefined') {
      return false;
    } else {
      const itemIndex = data[language].findIndex(o => o && o.uuid === uuid)
      if ( !data[language][itemIndex]) {
        return false;
      } else {
        if (data[language][itemIndex].created_at === created_at) {
          return true;
        } else {
          // data[language].splice(itemId, 1);
          // this.addAsArray(key, data);
          return false;
        }
      }
    }
  }

  isLandmarkIsDone(landmarkId: string, language: string) {
    const key = 'sts::statusPOI';
    let data = this.getAsObject(key);

    if (typeof data[language] === 'undefined') {
      return false;
    } else {
      const itemId = data[language].findIndex(i => i.uuid === landmarkId);

      return itemId !== -1;
    }
  }

  /**
   * Log des écoutes des audios.
   * @param target - "parcours" ou "interests"
   * @param uuid - id du target
   * @param lang - langue ciblée
   * @returns {boolean}
   */
  isAudioLoggedOrLogIt (target: string, uuid: string, lang: string) {
    const key = 'sts::audioLog';
    let data = this.getAsArray(key);

    const indexIndex = data.findIndex(i => {
      return i.uuid === uuid && i.target === target && i.lang === lang;
    });

    if (indexIndex === -1) {
      data.push({
        'uuid': uuid,
        'target': target,
        'lang': lang
      });

      this.addAsArray(key, data);
      return false;
    } else {
      return true;
    }
  }

  isLandmarkDownloaded(landmarkId: string) {
    const resp = {
      'isDownloaded': false,
      'isNetworkOff': false
    };
    let dataJson = [];
    const localStorageName = 'POI';
    const data = localStorage.getItem(localStorageName);

    if (data !== null) {
      try {
        dataJson = JSON.parse(data);
      } catch (e) {
        // Already been catched ahead in instance.
      } finally {
        resp.isDownloaded = typeof dataJson[landmarkId] !== 'undefined';
      }
    }
    // We need this check in devMode
    if (!this.platform.is('mobile') || this.platform.is('core')) {
    } else {
      resp.isNetworkOff = this.network.type === 'none';
    }

    return resp;
  }

  isParcoursDownloaded(parcoursId: string) {
    const resp = {
      'isDownloaded': false,
      'isNetworkOff': false
    };
    let dataJson = [];
    const localStorageName = 'Parcours';
    const data = localStorage.getItem(localStorageName);

    if (data !== null) {
      try {
        dataJson = JSON.parse(data);
      } catch (e) {
        // Already been catched ahead in instance.
      } finally {
        resp.isDownloaded = typeof dataJson[parcoursId] !== 'undefined';
      }
    }
    // We need this check in devMode
    if (!this.platform.is('mobile') || this.platform.is('core')) {
    } else {
      resp.isNetworkOff = this.network.type === 'none';
    }

    return resp;
  }

  isDownloaded(targetId: string, target: string) {
    if (target.toLowerCase() === 'parcours') {
      return this.isParcoursDownloaded(targetId)
    } else {
      return this.isLandmarkDownloaded(targetId);
    }
  }

  getAudio(targetId: string) {
    let audioURI = '';

    const data = localStorage.getItem('Parcours');
    let dataJson = [];

    if (data !== null) {
      try {
        dataJson = JSON.parse(data);
      } catch (e) {
        // Already been catched ahead in instance.
      } finally {
        audioURI = typeof dataJson[targetId] === 'undefined' ? '' : dataJson[targetId]['audio'];
      }
    }

    return audioURI;
  }

  getLandmarkAudio(targetId: string) {
    let audioURI = '';

    const data = localStorage.getItem('POI');
    let dataJson = [];

    if (data !== null) {
      try {
        dataJson = JSON.parse(data);
      } catch (e) {
        // Already been catched ahead in instance.
      } finally {
        audioURI = typeof dataJson[targetId] === 'undefined' ? '' : dataJson[targetId]['audio'];
      }
    }

    return audioURI;
  }
}
