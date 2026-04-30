import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pelicula, RespuestaTMDB } from '../models/pelicula.model';

@Injectable({
  providedIn: 'root',
})
export class TmdbService {
  // Separamos las constantes para mantener el código profesional
  private apiKey = 'f55142662bd652ab6b9c749dac9c0884';
  private baseUrl = 'https://api.themoviedb.org/3';

  constructor(public httpClient: HttpClient) {}

  // Ahora le decimos que espere el objeto RespuestaTMDB completo
  getPeliculasPopulares(): Observable<RespuestaTMDB> {
    const url = `${this.baseUrl}/movie/popular?api_key=${this.apiKey}`;
    return this.httpClient.get<RespuestaTMDB>(url);
  }
}
