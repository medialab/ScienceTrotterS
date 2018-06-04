export class City {
  id: string = '';
  title: string = '';
  image: string = '';

  constructor(item: any) {
    this.id = item.id;
    this.title = item.title;
    this.image = item.image;
  }

}
