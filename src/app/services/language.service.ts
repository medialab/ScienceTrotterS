import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  _langFilter: BehaviorSubject<string>;
  filter: Observable<string>;

  constructor() {
    const filter = localStorage.getItem('config::filterLang') || 'fr';
    this._langFilter = new BehaviorSubject(filter);
    this.filter = this._langFilter.asObservable();
  }

  updateLangFilter(value: string) {
    localStorage.setItem('config::filterLang', value);
    this._langFilter.next(value);
  }
}
