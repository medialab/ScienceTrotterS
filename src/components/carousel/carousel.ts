import {Component, Input} from '@angular/core';

@Component({
  selector: 'carousel',
  templateUrl: 'carousel.html'
})
export class CarouselComponent {
  @Input() images: Array<string> = [];

  btnCloseCarouselIsHidden: boolean = true;

  ngAfterViewInit () {
    this.setCurrentActiveItem();
    this.carouselItemObserver();
  }

  carouselItemSwitch (event: any) {
    const id = event.target.getAttribute('aria-controls');

    //noinspection TypeScriptUnresolvedFunction
    document.querySelector(`#${id}`).scrollIntoView({
      'behavior': 'smooth',
      'block': 'center',
      'inline': 'center'
    });
  }

  carouselItemObserver() {
    document.querySelector('.carousel__items').addEventListener('scroll', (event) => {
      this.setCurrentActiveItem();
    });
  }

  setCurrentActiveItem () {
    const itemActive = document.querySelector('.item__button[aria-hidden]');
    const items = document.querySelectorAll('.carousel__items__item');


    for (const index in items) {
      const item = items[index];
      const positionScroll = document.querySelector('.carousel__items').scrollLeft;
      const windowWidth: number = window.innerWidth;
      const imageActive = Math.round(positionScroll / item.clientWidth);

      if (typeof item === 'object') {
        const elSelector = document.querySelector(`[aria-controls="${item.id}"]`);

        if (item.id == ('tab-' + imageActive)) {
          item.setAttribute('aria-hidden', 'false');
          item.setAttribute('tabindex', '0');
          elSelector.setAttribute('aria-hidden', 'false');
        } else {
          item.setAttribute('aria-hidden', 'true');
          item.setAttribute('tabindex', '-1');
          elSelector.setAttribute('aria-hidden', 'true');
        }
      }
    }
  }

  showImage (img: string) {
    const items: NodeListOf<Element> = document.querySelectorAll('.unsetWithCarousel');

    for (let i = 0; i < items.length; i++) {
      items[i].classList.add('unsetDiv');
    }

    this.btnCloseCarouselIsHidden = false;

    document.querySelector('.caroussel__image-viewer').classList.remove('caroussel__image-viewer--hidden');
    document.querySelector('.caroussel__image-viewer__item').setAttribute('src', img)
    document.querySelector('.caroussel__image-viewer__item').setAttribute('aria-hiden', 'true')
  }

  closeImageViewer () {
    const items = document.querySelectorAll('.unsetWithCarousel');
    
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove('unsetDiv');
    }

    this.btnCloseCarouselIsHidden = true;

    document.querySelector('.caroussel__image-viewer').classList.add('caroussel__image-viewer--hidden');
    document.querySelector('.caroussel__image-viewer__item').setAttribute('aria-hiden', 'false')
  }


  getAriaControlName (i: any) {
    return 'tab-' + i;
  }
}
