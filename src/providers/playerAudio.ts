import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Events} from "ionic-angular";

@Injectable()
export class PlayerAudioProvider {
  tracks = [];

  clearAll () {
    this.tracks = [];
  }

  add (track: any, uuid: string) {
    if (typeof this.tracks[uuid] === 'undefined') {
      this.tracks[uuid] = track;
    }
  }

  get (uuid: string) {
    return typeof this.tracks[uuid] === 'undefined' ? false : this.tracks[uuid];
  }

  remote (uui: string) {
    // TODO : remove item.
  }

  /**
   * Gestion des lecteurs audio.
   * Met à jour l'état play/pause des différents players.
   *
   * @param curUUID
   * @returns {Promise<void>}
   */
  async isPlayingAndStopThem (curUUID: string = '') {
    await Object.values(this.tracks).map((item: any) => {
      if (item.isPlaying && item.uuid !== curUUID) {
        item.updateActionState();
      }
    });

    if (curUUID != '') {
      this.get(curUUID).updateActionState();
    }
  }

}
