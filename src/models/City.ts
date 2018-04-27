export class City {
  id: string = '';
  label: string = '';
  image: string = '';

  constructor(item: any) {
    this.id = item.id;
    this.label = item.label;
    this.image = item.image;
  }

}
