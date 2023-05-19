import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SearchResponse, Gif } from '../interfaces/gifs.interfaces';

@Injectable({ providedIn: 'root' })
export class GifsService {

  public gifList: Gif[] = [];

  private _tagsHistory: string[] = [];
  //Si no cargan los gifs lo mas probable es que haya que configurar la cuenta en https://developers.giphy.com/dashboard/
  private apiKey: string = 'DzYuR45Y5Nmomkv1eqrZRB3pdcRfZO2p';
  private serviceUrl: string = 'https://api.giphy.com/v1/gifs';

  constructor(private http: HttpClient) {
    this.loadLocalStorage();
    console.log('Gifs Service Ready');
  }

  get tagsHistory() {
    return [...this._tagsHistory];
  }

  private organizeHistory(tag: string) {
    tag = tag.toLowerCase(); //el pide en el html muestra todo bonito pero acá se guarda todo en minuscula

    if (this._tagsHistory.includes(tag)) { //solo los que tags diferentes los deja pasar
      this._tagsHistory = this._tagsHistory.filter((oldTag) => oldTag !== tag)
    }

    this._tagsHistory.unshift(tag); //inserta el nuevo elemento al inicio
    this._tagsHistory = this.tagsHistory.splice(0, 10);//se limita el arreglo a 10 tags
    this.saveLocalStorage(); //graba en el localstorage
  }

  private saveLocalStorage(): void {
    localStorage.setItem('history', JSON.stringify(this._tagsHistory));
  }

  private loadLocalStorage(): void {
    if (!localStorage.getItem('history')) return;

    this._tagsHistory = JSON.parse(localStorage.getItem('history')!);

    if (this._tagsHistory.length === 0) return;
    this.searchTag(this._tagsHistory[0]);
  }


  searchTag(tag: string): void {
    if (tag.length === 0) return;
    this.organizeHistory(tag);

    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('limit', '12') //para no cargar mas de 12 gifs
      .set('q', tag)

    this.http.get<SearchResponse>(`${this.serviceUrl}/search`, { params })
      .subscribe(resp => {

        this.gifList = resp.data;
        // console.log({ gifs: this.gifList });

      });
  }


}
