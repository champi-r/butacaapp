export interface Pelicula {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  poster_path: string;
  genre_ids: number[];
  // -- DATOS INYECTADOS LOCALMENTE (Opcionales) --
  director?: string; 
  nombres_generos?: string[]; // Para guardar ["Sci-Fi", "Thriller"]
}

export interface RespuestaTMDB {
  page: number;
  results: Pelicula[]; // Acá es donde realmente vive tu arreglo
  total_pages: number;
  total_results: number;
}