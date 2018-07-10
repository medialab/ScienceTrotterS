import { Injectable } from '@angular/core';

@Injectable()
export class LocalDataProvider {
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
   * sous forme d'un tableau.
   * @param key
   * @returns {any}
   */
  getAsArray (key: string) {
    let data: any = this.get(key);

    if (data === null) {
      return {};
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
  addParcoursDone (uuid: string, language: string) {
    const key = 'sts::statusParcours';
    let data: any = this.getAsArray(key);

    if (typeof data[language] !== 'undefined') {
      if (data[language].indexOf(uuid) === -1) {
        data[language].push(uuid);
      }
    } else {
      data[language] = [];
      data[language].push(uuid);
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
  isParcoursIsDone (uuid: string, language: string) {
    const key = 'sts::statusParcours';
    let data = this.getAsArray(key);

    if (typeof data[language] === 'undefined') {
      return false;
    } else {
      return data[language].indexOf(uuid) !== -1;
    }
  }

  /**
   * Ajout d'un point d'intérêt ) la liste de ceux complétés.
   * @param uuid
   * @param language
   * @returns {any}
   */
  addPOIDone (uuid: string, language: string) {
    const key = 'sts::statusPOI';
    let data: any = this.getAsArray(key);

    if (typeof data[language] !== 'undefined') {
      if (data[language].indexOf(uuid) === -1) {
        data[language].push(uuid);
      }
    } else {
      data[language] = [];
      data[language].push(uuid);
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
  isPOIIsDone (uuid: string, language: string) {
    const key = 'sts::statusPOI';
    let data = this.getAsArray(key);

    if (typeof data[language] === 'undefined') {
      return false;
    } else {
      return data[language].indexOf(uuid) !== -1;
    }
  }
}
