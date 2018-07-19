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
  addParcoursDone ({uuid, created_at}, language: string) {

    console.log('uuid', uuid, 'created_at', created_at);

    const key = 'sts::statusParcours';
    let data: any = this.getAsArray(key);

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
  addPOIDone ({uuid, created_at}, language: string) {
    const key = 'sts::statusPOI';
    let data: any = this.getAsArray(key);

    if (typeof data[language] !== 'undefined') {
      const itemId = data[language].findIndex(i => i.uuid === uuid);

      if (itemId === -1) {
        // SAVE DU POI.
        data[language].push({
          'uuid': uuid,
          'created_at': created_at
        });
      } else {
        // MAJ DU POI
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
   * Vérifie si un point d'intérêt est complété.
   * @param uuid
   * @param language
   * @returns {boolean}
   */
  isPOIIsDone ({uuid, created_at}, language: string) {
    const key = 'sts::statusPOI';
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
}
