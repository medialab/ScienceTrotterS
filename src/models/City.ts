export class City {
  id: string = '';
  title: string = '';
  image: string = '';
  force_lang: string = null;

  constructor(item: any) {
    this.id = item.id;
    this.title = item.title;
    this.image = item.image;
    this.force_lang = item.force_lang;
  }
}
