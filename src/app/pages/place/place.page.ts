import { bbCodeToHtml } from './../../utils/helper';
import { LanguageService } from './../../services/language.service';
import { NetworkService } from './../../services/network.service';
import { LoadingController, Platform } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { AudioPlayerComponent } from './../../components/audio-player/audio-player.component';
import { OfflineStorageService } from './../../services/offline-storage.service';
import { ConfigService } from './../../services/config.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, ViewChild} from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { ApiService } from './../../services/api.service';
@Component({
  selector: 'app-place',
  templateUrl: './place.page.html',
  styleUrls: ['./place.page.scss'],
})
export class PlacePage implements OnInit {
  place: any = null;
  parcour: any;
  placesList: any[];

  filterLang: string = 'fr';

  helpItemActive: boolean=false;

  showAudioScript: boolean = false;
  isPlaceVisited: boolean = false;

  slideOpts = {
    speed: 400,
    zoom: false
  };

  coverUrl: string = null;
  offlineCoverUrl: string = null;
  placeAudioUrl: string = null;
  offlineAudioUrl: string= null;
  gallery: any;
  offlineGallery: any;

  @ViewChild(AudioPlayerComponent) audioPlayer: AudioPlayerComponent;

  constructor(
    public translate: TranslateService,
    public language: LanguageService,
    public config: ConfigService,
    public offlineStorage: OfflineStorageService,
    public sanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private platform: Platform,
    private loader: LoadingController,
    public network: NetworkService,
    public api: ApiService
  ) {
    // this.translate.onLangChange.subscribe(() => {
    //   this.initPlace()
    // })
    this.language.filter.subscribe((lang) => {
      this.filterLang = lang;
      this.initPlace();
    })
  }

  ngOnInit() {
  }

  initPlace() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if(id) {
      this.activatedRoute.queryParams
      .subscribe(async () => {
        if (this.router.getCurrentNavigation().extras.state) {
          this.parcour = this.router.getCurrentNavigation().extras.state.parcour;
          this.placesList = this.router.getCurrentNavigation().extras.state.placesList;
          const place = this.placesList.find((place) => place.id === id)
          this.initPlaceData(place);
        } else {
          // direct access
          const place = await this.api.get(`/public/interests/byId/${id}?lang=${this.filterLang}`);
          this.initPlaceData(place);
        }
      })
    }
  }

  async initPlaceData(place: any) {
    if(!place) return;
    this.place = place;
    this.gallery = Object.values(place['gallery_image'])
          .map((item: any) => this.api.getAssetsUri(item));
    this.isPlaceVisited = this.offlineStorage.isVisited(place['cities_id'], 'places', place.id);

    const coverUrl = this.api.getAssetsUri(place.header_image);
    const audioUrl = this.api.getAssetsUri(place.audio[this.filterLang]);

    this.coverUrl = coverUrl;
    this.placeAudioUrl = audioUrl;

    if(this.isDownloaded()) {
      const loading = await this.loader.create();
      loading.present();
      const offlineUrls = [coverUrl, audioUrl, ...this.gallery].map(async (url) => {
        const blob = await this.offlineStorage.getRequest(url);
        const offlineUrl = ((window as any).URL ? (window as any).URL : (window as any).webkitURL).createObjectURL(blob);
        return offlineUrl;
      });
      this.coverUrl = await offlineUrls[0];
      this.placeAudioUrl = await offlineUrls[1];
      this.gallery = await Promise.all(offlineUrls.slice(2));
      loading.dismiss();
    }
  }

  ionViewWillLeave() {
    if(this.audioPlayer) {
      this.audioPlayer.forcePause();
    }
  }

  onNextPlace(dir: string) {
    const currentIndex = this.placesList.findIndex(item => item.id === this.place.id);
    let nextIndex = dir === 'next' ? currentIndex + 1 : currentIndex -1
    if (nextIndex === -1) {
      nextIndex = this.placesList.length -1;
    }
    if (nextIndex === this.placesList.length) {
      nextIndex = 0
    }
    this.navigatePlace(this.placesList[nextIndex].id);
  }

  navigatePlace(placeId: string) {
    if(this.network.isConnected() || this.offlineStorage.isDownloaded(this.filterLang, this.place['cities_id'], 'places', placeId)) {
      let navigationExtras: NavigationExtras = {
        skipLocationChange: true,
        state: {
          parcour: this.parcour,
          placesList: this.placesList
        }
      };
      this.router.navigate([`/place/${placeId}`], navigationExtras)
    } else {
      this.network.alertMessage();
    }
  }

  onClickSetHelpItemActive(active: boolean=false) {
    this.helpItemActive = this.helpItemActive ? false : active;
  }

  openMapToLocation() {
    if(this.place.geoloc) {
      if(this.platform.is('android')) {
        window.open(`geo:${this.place.geoloc.latitude},${this.place.geoloc.longitude}?q=${this.place.geoloc.latitude},${this.place.geoloc.longitude}`);
      }
      if(this.platform.is('ios')) {
        window.open(`http://maps.apple.com/?ll=${this.place.geoloc.latitude},${this.place.geoloc.longitude}&q=${this.place.title[this.filterLang]}`)
      }
    }
  }

  onToggleAudioScript() {
    this.showAudioScript = !this.showAudioScript;
  }

  scrollToSection(id: string) {
    const focustElement = document.getElementById(id);
    if(id === 'section-audio') {
      this.showAudioScript = true;
      setTimeout(() => {
        focustElement.scrollIntoView({ behavior: 'smooth'});
      }, 150);
    } else {
      focustElement.scrollIntoView({ behavior: 'smooth'});
    }
  }

  showBiblio() {
    const biblio = this.place.bibliography[this.filterLang];
    let isShow = false;

    for (const itemDesc of biblio) {
      if (itemDesc !== '') {
        isShow = true;
        break;
      }
    }
    return isShow;
  }

  toggleViewPlace() {
    this.isPlaceVisited = !this.isPlaceVisited;
    if (this.place['cities_id'] && this.place.id) {
      this.offlineStorage.updateVisited(this.place['cities_id'], 'places', this.place.id, this.isPlaceVisited);
      // navigate to next unvisited place in the parcour
      if(this.placesList && this.parcour) {
        const nonVisitedList = this.placesList.filter((place) => !this.offlineStorage.isVisited(this.place['cities_id'], 'places', place.id));
        if(nonVisitedList.length === 0) {
          this.offlineStorage.updateVisited(this.place['cities_id'], 'parcours', this.parcour.id, true);
          this.router.navigate([`/city/${this.place['cities_id']}`]);
        } else {
          this.offlineStorage.updateVisited(this.place['cities_id'], 'parcours', this.parcour.id, false);
          if(this.isPlaceVisited) {
            this.navigatePlace(nonVisitedList[0].id);
          }
        }
      }
    }
  }

  isDownloaded() {
    return this.offlineStorage.isDownloaded(this.filterLang, this.place['cities_id'], 'places', this.place.id)
  }

  /**
  * Envoi d'un message pour signaler un problème
  * par mail.
  */
  async btnReportProblem() {
    const city = await this.api.get(`/public/cities/byId/${this.place['cities_id']}?lang=${this.filterLang}`);
    const to = 'forccast.controverses@sciencespo.fr';

    this.translate.get(['MAIL_REPORT_PROBLEM_SUBJECT','MAIL_REPORT_PROBLEM_BODY'], {
      'landmarkName': this.place.title[this.filterLang],
      'cityName': city.title[this.filterLang],
    }).subscribe((resp) => {
      const subject = resp['MAIL_REPORT_PROBLEM_SUBJECT'];
      const body = resp['MAIL_REPORT_PROBLEM_BODY'];
      window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_system', 'location=no');
    })
  }


  /**
   * Partage du point d'inrétêt courant par mail.
   */
  async btnShareRef() {
    this.translate.get('MAIL_SHARE_BIBLIO_SUBJECT', {
      'landmarkName': this.place.title[this.filterLang],
    }).subscribe(async (subject) => {
      let body = '';
      for (let itemDesc of this.place.bibliography[this.filterLang]) {
        body += itemDesc.replace(' & ',' et ') + '\n';
      }
      const shareData = {
        title: subject,
        text: body,
        url: window.location.href
      }
      try {
        await navigator.share(shareData);
        console.log('shared successfully')
      } catch(err) {
        console.log('Err' + err)
      }
    })
  }

  /**
  *
  * @param str
  * @param length
  * @returns {string}
  */
  sliceStr(str: string, length: number) {
    if (str.length > length) {
      return str.slice(0, (length - 3)) + '...';
    } else {
      return str.slice(0, length);
    }
  }

  bbToHtml(text: string) {
    return bbCodeToHtml(text);
  }
}
