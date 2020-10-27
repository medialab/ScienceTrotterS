import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  playlist: any = {};
  constructor() {}

  addTrack (track: any, id: string) {
    if (typeof this.playlist[id] === 'undefined') {
      this.playlist[id] = track;
    }
  }

  getTrack (id: string) {
    return this.playlist[id]
  }
}
