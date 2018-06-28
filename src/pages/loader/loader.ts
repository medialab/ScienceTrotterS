import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-loader',
  templateUrl: 'loader.html',
})
export class LoaderPage {

  citiesCoords: object = {
    'lat': 48.856578,
    'lng': 2.351828
  };

  img = 'https://images.unsplash.com/photo-1529933072015-5a5248282ad0?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=883900194a4936e1179604d72bf128ff&auto=format&fit=crop&w=2251&q=80';

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoaderPage');
    // this.initCarousel();
  }

  initCarousel () {

    /*
    const items = document.querySelectorAll('.carousel__items__item');

    //noinspection TypeScriptUnresolvedFunction
    Object.values(items).map(item => this.carouselItemObserver(item));
  }

  carouselItemSwitch(event: any) {
    const id = event.target.getAttribute('aria-controls');

    //noinspection TypeScriptUnresolvedFunction
    document.querySelector(`#${id}`).scrollIntoView({
      'behavior': 'smooth',
      'block': 'center',
      'inline': 'center'
    });

    */

  }

  carouselItemObserver (el) {

    /**
     *
     *
    document.querySelector('.carousel__items').addEventListener('scroll', (event) => {
      const itemActive = document.querySelector('.item__button[aria-hidden');
      const items = document.querySelectorAll('.carousel__items__item');

      //noinspection TypeScriptUnresolvedFunction
      Object.values(items).map(item => {
        const pos: any = item.getBoundingClientRect();
        const windowWidth: number = window.innerWidth;
        const posPourcentage: number = (pos.x * 100 / windowWidth).toFixed(2);
        const elSelector = document.querySelector(`[aria-controls="${item.id}"]`);

        if (posPourcentage > 35 && posPourcentage < 65) {
          item.setAttribute('aria-hidden', 'false');
          item.setAttribute('tabindex', '0');
          elSelector.setAttribute('aria-hidden', 'false');
        } else {
          item.setAttribute('aria-hidden', 'true');
          item.setAttribute('tabindex', '-1');
          elSelector.setAttribute('aria-hidden', 'true');
        }
      });
    });

    const opts = {
      'root': null,
      'rootMargin': '-20px',
      'threshold': [0, 0.25, 0.5, 0.75, 1]
    };

    const handleIntersect = (e) => {
      // TODO : calculer la différence des dimentions.
      const isVisible = e[0].isIntersecting;
      const ratio = (e[0].intersectionRatio * 100);
      const el = e[0].target;
      const elSelector = document.querySelector(`[aria-controls="${el.id}"]`);

      if (el.id === 'tab-1') {
        console.log('el', e[0].boundingClientRect);
      }

      if (isVisible && ratio > 60) {
        el.setAttribute('aria-hidden', 'false');
        el.setAttribute('tabindex', '0');
        elSelector.setAttribute('aria-hidden', 'false');
      } else {
        el.setAttribute('aria-hidden', 'true');
        el.setAttribute('tabindex', '-1');
        elSelector.setAttribute('aria-hidden', 'true');
      }
    };

    const observer = new IntersectionObserver(handleIntersect, opts);
    observer.observe(el);

    */
  }
}
