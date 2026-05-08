import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { Pelicula, RespuestaTMDB } from '../models/pelicula.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TmdbService {
  // Separamos las constantes para mantener el código profesional
  private apiKey = environment.tmdbApiKey;
  private baseUrl = environment.tmdbBaseUrl;
  private language = 'es-ES';
  private generosMap: { [id: number]: string } = {}; 

  constructor(private httpClient: HttpClient) {}
  generosLista: { id: number; nombre: string }[] = [];

  getGeneros(): Observable<any> {
    const url = `${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}&language=${this.language}`;
    return this.httpClient.get<any>(url).pipe(
      tap(res => {
        res.genres.forEach((g: any) => {
          this.generosMap[g.id] = g.name;
        });
        this.generosLista = res.genres.map((g: any) => ({ id: g.id, nombre: g.name })); 
      })
    );
   } 
   
  getIdGenero(nombre: string): number | undefined {
    const entry = Object.entries(this.generosMap).find(
      ([_, value]) => value.toLowerCase().includes(nombre.toLowerCase())
    );
    return entry ? Number(entry[0]) : undefined;
  }
  
  getNombreGenero(ids: number[]): string { 
    if (!ids?.length) return 'Sin género';
    return ids.slice(0, 2).map(id => this.generosMap[id] ?? 'Otro').join(' · ');
  } 

  getPeliculasPopulares(): Observable<RespuestaTMDB> {
    // La estructura correcta es: BASE + RECURSO + ? + API_KEY + & + IDIOMA
    const url = `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=${this.language}`;
    return this.httpClient.get<RespuestaTMDB>(url);
  }

  getMasValoradas(): Observable<RespuestaTMDB> {
  const url = `${this.baseUrl}/movie/top_rated?api_key=${this.apiKey}&language=${this.language}`;
  return this.httpClient.get<RespuestaTMDB>(url).pipe(
    catchError(err => throwError(() => new Error('Error al cargar valoradas.')))
  );
  }

  getDetallesPelicula(id: number): Observable<any> {
    // Traemos los créditos (director) y los proveedores (plataformas) al mismo tiempo
    const url = `${this.baseUrl}/movie/${id}?api_key=${this.apiKey}&language=${this.language}&append_to_response=credits,watch/providers`;
    return this.httpClient.get<any>(url);
  }

  buscarPeliculas(texto: string): Observable<RespuestaTMDB> {
  const url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&language=${this.language}&query=${encodeURIComponent(texto)}`;
  
  return this.httpClient.get<RespuestaTMDB>(url).pipe(
    catchError(err => {
      console.error('Error en la petición:', err);
      // Retornamos el error para que el componente lo maneje
      return throwError(() => new Error('No se pudo conectar con el servidor.'));
    })
  );
  }

  buscarPorAnio(year: string): Observable<RespuestaTMDB> {
    // Usamos el endpoint 'discover' para filtrar específicamente por el año de lanzamiento
    const url = `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&language=${this.language}&primary_release_year=${year}&sort_by=popularity.desc`;
    
    return this.httpClient.get<RespuestaTMDB>(url).pipe(
      catchError(err => {
        console.error('Error buscando por año:', err);
        return throwError(() => new Error('Error al filtrar por año.'));
      })
    );
  }

  buscarPorGenero(idGenero: number): Observable<RespuestaTMDB> {
    const url = `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&language=${this.language}&with_genres=${idGenero}`;
    return this.httpClient.get<RespuestaTMDB>(url);
  }

  buscarPersona(nombre: string): Observable<any> {
    const url = `${this.baseUrl}/search/person?api_key=${this.apiKey}&language=${this.language}&query=${encodeURIComponent(nombre)}`;
    return this.httpClient.get<any>(url);
  }

  buscarPeliculasPorDirector(personId: number): Observable<RespuestaTMDB> {
    const url = `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&language=${this.language}&with_crew=${personId}`;
    return this.httpClient.get<RespuestaTMDB>(url);
  }
}