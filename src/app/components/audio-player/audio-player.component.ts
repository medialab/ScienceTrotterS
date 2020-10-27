import { AudioService } from './../../services/audio.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, AfterViewInit, Input,Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';

@Component({
  selector: 'audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent implements OnInit, AfterViewInit {
  @Input() audioUrl: string = '';
  @Input() playerUUID: string = '';
  @Input() loadPlayer: boolean = false;
  @Input() showAudioScript: boolean=false;
  @Input() target: string = '';
  @Input() uuid: string = '';
  @Input() isNetworkOff: boolean = false;
  @Input() isDownloaded: boolean = false;

  @Output() toggleAudioScript = new EventEmitter<any>();
  track: any = null;
  isPlaying: boolean = false;
  duration: number = 0;
  currentTime: number = 0;
  audioPlayer: any = null;
  constructor(
    public translate: TranslateService,
    private audioService: AudioService
  ) {}

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.track = document.querySelector(`#${this.playerUUID}`);
    this.track.addEventListener('canplay', () => {
      this.duration = this.track.duration;
      this.audioService.addTrack(this.track, this.uuid);
    });
    this.track.addEventListener('timeupdate', (event) => {
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

  downVolume() {
    console.log(this.track.volume)
  }

  upVolume() {
    console.log(this.track.volume)
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

  isNotAvailable() {
    return false;
  }
}
