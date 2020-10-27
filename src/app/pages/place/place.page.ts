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

  helpItemActive: boolean=false;

  showAudioScript: boolean = false;
  isDownloaded: boolean = false;
  isNetworkOff: boolean = false;
  isPlaceVisited: boolean = false;

  slideOpts = {
    speed: 400
  };

  gallery: any;
  @ViewChild(AudioPlayerComponent) audioPlayer: AudioPlayerComponent;

  constructor(
    public translate: TranslateService,
    public config: ConfigService,
    public offlineStorage: OfflineStorageService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public api: ApiService
  ) {}

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if(id) {
      this.activatedRoute.queryParams.subscribe(() => {
        if (this.router.getCurrentNavigation().extras.state) {
          this.parcour = this.router.getCurrentNavigation().extras.state.parcour;
          this.placesList = this.router.getCurrentNavigation().extras.state.placesList;
        }
      });
      this.api.get(`/public/interests/byId/${id}?lang=${this.translate.currentLang}`)
      .subscribe((resp: any) => {
        if (resp.success) {
          this.place = resp.data;
          this.gallery = Object.values(resp.data['gallery_image'])
          .map((item: any) => this.api.getAssetsUri(item));
        }
        this.isPlaceVisited = this.offlineStorage.isVisited(resp.data['cities_id'], 'places', id);
        }, (err: any) => {});
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
    let navigationExtras: NavigationExtras = {
      skipLocationChange: true,
      state: {
        parcour: this.parcour,
        placesList: this.placesList
      }
    };
    this.router.navigate([`/place/${placeId}`], navigationExtras)
  }

  onClickSetHelpItemActive(active: boolean=false) {
    this.helpItemActive = this.helpItemActive ? false : active;
  }

  openMapToLocation() {

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
    const biblio = this.place.bibliography[this.translate.currentLang];
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
      if(this.placesList) {
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


  /**
  * Envoi d'un message pour signaler un problème
  * par mail.
  */
  btnReportProblem() {
    // const to = this.config.data.contact_mail;
    // const subject = this.translate.getKeyAndReplaceWords('MAIL_REPORT_PROBLEM_SUBJECT', {
    //   'landmarkName': this.getData('title', true),
    //   'cityName': this.cityName
    // });
    // const body = this.translate.getKeyAndReplaceWords('MAIL_REPORT_PROBLEM_BODY', {
    //   'landmarkName': this.getData('title', true),
    //   'cityName': this.cityName
    // });

    // this.data.sendEmail(to, subject, body);
  }


  /**
   * Partage du point d'inrétêt courant par mail.
   */
  btnShareRef() {
    // const subject = this.translate.getKeyAndReplaceWords('MAIL_SHARE_BIBLIO_SUBJECT', {
    //   'landmarkName': this.getData('title', true),
    //   'cityName': this.cityName
    // });

    // //const preBody = this.translate.getKey('MAIL_SHARE_BIBLIO_BODY');
    // let body = `[b]${subject}[/b][jumpLine]`;

    // for (let itemDesc of this.getData('bibliography', true)) {
    //   console.log(itemDesc)
    //   body += itemDesc.replace(' & ',' et ') + '[jumpLine]';
    // }

    // this.data.sendEmail('', subject, this.data.bbCodeToMail(body));
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
}
