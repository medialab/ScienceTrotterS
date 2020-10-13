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
      if (this.track !== null) {
        this.track.load();
        this.track.ontimeupdate = this.onTimeUpdate.bind(this);
        this.track.oncanplay = this.onCanPlay.bind(this);
        // HACK default loading.
        this.onCanPlay();
      }
    }, 150);
  }

  set durationCurrent (nextState: any) {

  }

  get durationCurrent () {
    return this.duration.track.current;
  }

  onCanPlay () {
    const maxTry = 5;
    let curTry = 0;

    const setTime = () => {
      if (! isNaN(this.track.duration)) {
        this.duration.track.max = this.track.duration;
        this.duration.full = this.formatSecondsAsTime(this.track.duration);

      } else {
        curTry++;
        if (curTry <= maxTry) {
          setTimeout(setTime, 125);
        }
      }
    };

    setTime();
  }

  onTimeUpdate () {
    this.duration.track.current = this.track.currentTime;
    this.duration.current = this.formatSecondsAsTime(this.track.currentTime);

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
      this.isPlaying = false;
      this.track.pause();
    } else {
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

  formatSecondsAsTime(secs) {
    let hr: any = Math.floor(secs / 3600);
    let min: any = Math.floor((secs - (hr * 3600))/60);
    let sec: any = Math.floor(secs - (hr * 3600) -  (min * 60));

    if (min < 10){
      min = "0" + min;
    }
    if (sec < 10){
      sec  = "0" + sec;
    }

    return min + ':' + sec;
  }
}
