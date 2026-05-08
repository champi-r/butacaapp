export interface Pelicula {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  poster_path: string;
  overview: string;
  popularity: number;
  genre_ids: number[];
  director?: string; 
  nombres_generos?: string[]; 
}

export interface RespuestaTMDB {
  page: number;
  results: Pelicula[]; 
  total_pages: number;
  total_results: number;
}