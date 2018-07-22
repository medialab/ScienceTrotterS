export class PlayerAudio {
  uuid: string;
  uri: string;
  isPlaying: boolean = false;
  track: any;

  duration = {
    min: '00.00',
    current: '00.00',
    full: '00.00',
    track: {
      current: 0,
      min: 0,
      max: 0
    }
  };

  constructor (uuid: string, uri: string) {
    this.uuid = uuid;
    this.uri = uri;
  }

  init () {
    setTimeout(() => {
      this.track = document.querySelector(`#${this.uuid}`);
      this.track.ontimeupdate = this.onTimeUpdate.bind(this);
      this.track.oncanplay = this.onCanPlay.bind(this);
      // HACK default loading.
      this.onCanPlay();
    }, 150);
  }

  set durationCurrent (nextState: any) {

  }

  get durationCurrent () {
    return this.duration.track.current;
  }

  onCanPlay () {
    const duration: any = (this.track.duration / 60).toFixed(2);

    this.duration.track.max = this.track.duration;
    this.duration.full = duration < 10 ? '0' + duration : duration;
  }

  onTimeUpdate () {
    const nextCurTime = this.track.currentTime.toFixed(2);

    this.duration.track.current = parseInt(nextCurTime, 10);

    if (nextCurTime < 60) {
      this.duration.current = nextCurTime < 10 ? '00.0' + parseInt(nextCurTime) : '00.' + parseInt(nextCurTime);
    } else {
      this.duration.current = '0' + (nextCurTime / 60).toFixed(2);
    }

    // Si l'audio est terminé on change l'état à pause.
    if (this.track.currentTime === this.track.duration && this.isPlaying) {
      this.updateActionState();
    }
  }

  actionFastLeft () {
    this.track.currentTime -= 30.00;
  }

  actionFastRight () {
    this.track.currentTime += 30.00;

    if (this.track.currentTime === this.track.duration && ! this.isPlaying) {
      this.updateActionState();
    }
  }

  updateActionState () {
    if (this.isPlaying) {
      console.log('pause();');
      this.isPlaying = false;
      this.track.pause();
    } else {
      console.log('play();')
      this.isPlaying = true;

      this.track.play().then(() => {
        // NONE.
      }).catch((err: any) => {
        console.log('err', err);
      });
    }
  }

  upVolume () {
    if (this.track.volume <= 0.9) {
      this.track.volume += 0.1;
    }
  }

  downVolume () {
    if (this.track.volume >= 0.1) {
      this.track.volume -= 0.1;
    }
  }
}
