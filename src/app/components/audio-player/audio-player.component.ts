import { AudioService } from './../../services/audio.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() audioUrl: string = '';
  @Input() playerUUID: string = '';
  @Input() loadPlayer: boolean = false;
  @Input() showAudioScript: boolean=false;
  @Input() target: string = '';
  @Input() uuid: string = '';
  @Input() isNetworkOff: boolean = false;

  @Output() toggleAudioScript = new EventEmitter<any>();

  track: any = null;
  isPlaying: boolean = false;
  duration: number = 0;
  currentTime: number = 0;
  sanitizedUrl: any= null;
  constructor(
    public translate: TranslateService,
    private sanitizer: DomSanitizer,
    private audioService: AudioService
  ) {}

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes["audioUrl"] && this.audioUrl) {
      this.sanitizedUrl = this.sanitizer.bypassSecurityTrustUrl(this.audioUrl);
    }
  }

  ngAfterViewInit() {
    this.track = document.querySelector(`#${this.playerUUID}`);
    this.track.addEventListener('canplay', () => {
      this.duration = this.track.duration;
      // this.audioService.addTrack(this.track, this.uuid);
    });
    this.track.addEventListener('timeupdate', () => {
      this.currentTime = this.track.currentTime;
    })
    this.track.addEventListener('play', () => this.isPlaying = true);
    this.track.addEventListener('pause', () => this.isPlaying= false);

  }

  togglePlay() {
    if(this.isPlaying) {
      this.track.pause();
    } else {
      this.track.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  forcePause() {
    this.track.pause()
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

  actionFastLeft () {
    this.track.currentTime -= 30.00;
  }

  actionFastRight () {
    this.track.currentTime += 30.00;
  }

  changeRangeStart() {
    if(this.isPlaying) {
      this.track.pause();
    }
    this.isPlaying = false;
  }

  changeRangeEnd() {
    this.track.play();
  }

  onChangeCurrentTime(event: any) {
    if (event.detail.value && !this.isPlaying) {
      this.track.currentTime = event.detail.value;
    }
  }

  onClickAudioScript () {
    this.toggleAudioScript.emit();
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

  isNotAvailable() {
    return false;
  }
}
