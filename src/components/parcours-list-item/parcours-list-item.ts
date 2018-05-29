import {Component, Input} from '@angular/core';

@Component({
  selector: 'parcours-list-item',
  templateUrl: 'parcours-list-item.html'
})
export class ParcoursListItemComponent {

  _isOpenDiscover: boolean = false;

  contentDiscover = {
    contentDiscover: true,
    isOpen: false
  };

  @Input() previewTitle: string = '';
  @Input() previewDescription: string = '';
  @Input() color: string = 'red';

  @Input()
  set isOpenDiscover(nextState: boolean) {
    this._isOpenDiscover = nextState;
    this.contentDiscover.isOpen = nextState;
  }
  get isOpenDiscover() {
    return this._isOpenDiscover;
  }

  constructor() {
    console.log('Hello ParcoursListItemComponent Component');
  }

  updateDiscoverState() {
    if (this.isOpenDiscover) {
      this.isOpenDiscover = false;
      this.contentDiscover.isOpen = false;
    } else {
      this.isOpenDiscover = true;
      this.contentDiscover.isOpen = true;
    }
  }

}
