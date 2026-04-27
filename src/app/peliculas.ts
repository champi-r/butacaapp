import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Peliculas {
  constructor(
    public httpClient: HttpClient
  ){
    console.log('Api movies corriendo');
  }

  obtenerDestacados(){
    return this.httpClient.get('https://api.themoviedb.org/3/movie/popular?api_key=f55142662bd652ab6b9c749dac9c0884&language=es-ES')
  }
}
