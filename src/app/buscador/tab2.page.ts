import { Component, OnInit, ViewChild } from '@angular/core';
import { Pelicula } from '../models/pelicula.model';
import { TmdbService } from '../services/tmdb'; 
import { IonModal, IonSearchbar, AlertController, ToastController, ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-buscador',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class BuscadorPage implements OnInit {
  @ViewChild('modal') modal!: IonModal;
  @ViewChild('searchbar') searchbar!: IonSearchbar;

  peliculas: Pelicula[] = [];
  filtroActivo: string = 'Título';
  cargando: boolean = false;
  mostrandoPopulares: boolean = true;
  peliSeleccionada: Pelicula | null = null;
  pendientes: Pelicula[] = [];
  generoSeleccionado: string = '';
  directorModal: string = 'Cargando...';
  plataformasModal: any[] = [];
  idGeneroSeleccionado: number | null = null;
  ultimoTerminoBuscado: string = '';

  filtros = [
    { nombre: 'Título', icono: 'text-outline' },
    { nombre: 'Género', icono: 'apps-outline' },
    { nombre: 'Año', icono: 'calendar-outline' },
    { nombre: 'Director', icono: 'person-outline' },
    { nombre: 'Más Valoradas', icono: 'star-outline' }
  ];

  constructor(
    public tmdbService: TmdbService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController
  ) {}

  /**
   * Inicializa el componente. Carga la lista base de géneros desde TMDB
   * y recupera el estado del almacenamiento local para la lista de pendientes.
   */
  ngOnInit() {
    this.tmdbService.getGeneros().subscribe(() => {
    this.cargarPopulares(true);
  });

  const guardados = localStorage.getItem('watchlist');
    if (guardados) {
      this.pendientes = JSON.parse(guardados);
    }
  }

  /**
   * Implementa una función lúdica que consulta las películas populares,
   * altera su orden de manera aleatoria y presenta un subconjunto sorpresivo al usuario.
   */
  buscarAlAzar() {
    this.cargando = true;
    this.filtroActivo = 'Suerte'; 
    this.mostrandoPopulares = false;
    this.ultimoTerminoBuscado = '';
    
    this.tmdbService.getPeliculasPopulares().subscribe({
      next: (resp) => {
        const mezcladas = resp.results.sort(() => 0.5 - Math.random());
        
        this.peliculas = mezcladas.slice(0, 3);
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  /**
   * Ejecuta una búsqueda de texto libre contra la API de TMDB.
   * @param termino - La cadena de texto ingresada por el usuario en el buscador.
   */
  ejecutarBusqueda(texto: string) {
    this.cargando = true;
    this.tmdbService.buscarPeliculas(texto).subscribe({
      next: (resp) => { 
        this.peliculas = resp.results; 
        this.cargando = false; 
      },
      error: () => this.cargando = false
    });
  }
  
  /**
   * Construye y despliega un menú nativo (Action Sheet) en la parte inferior
   * para permitir al usuario cambiar el criterio principal de búsqueda.
   */
  async abrirMenuFiltros() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Selecciona un filtro',
      buttons: [
        ...this.filtros.map(f => ({
          text: f.nombre,
          icon: f.icono,
          handler: () => {
            this.cambiarFiltro(f.nombre);
          }
        })),
      {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel'
      }
      ]
    });
    await actionSheet.present();
  }

  /**
   * Intercepta el cambio de filtro desde la UI y resetea los estados de la clase
   * para preparar la vista antes de la nueva petición a la API.
   * @param nombre - El nombre del filtro seleccionado (ej. 'Año', 'Género').
   */
  cambiarFiltro(nombre: string) {
    this.filtroActivo = nombre;

    if (nombre === 'Más Valoradas') {
      this.ultimoTerminoBuscado = '';
      this.cargando = true;
      this.mostrandoPopulares = false;
      this.tmdbService.getMasValoradas().subscribe({
        next: (resp) => {
          this.peliculas = resp.results;
          this.cargando = false;
        },
        error: () => this.cargando = false
      });
    } else if (nombre === 'Género') {
      this.peliculas = []; 
      this.ultimoTerminoBuscado = '';
      this.mostrandoPopulares = false;
    } else {
      if (this.ultimoTerminoBuscado.trim().length > 0 && this.idGeneroSeleccionado === null) {
        this.ejecutarBusqueda(this.ultimoTerminoBuscado);
      } else {
        this.idGeneroSeleccionado = null;
        this.ultimoTerminoBuscado = '';
        this.cargarPopulares(true);
      }
    }
  }

  /**
   * Evalúa el input del usuario en tiempo real y bifurca la lógica de petición
   * a la API dependiendo del filtro que se encuentre activo en ese momento.
   * @param event - El evento del DOM emitido por el componente ion-searchbar.
   */
  onSearchChange(event: any) {
    const valor = event.detail.value;
    if (!valor || valor.trim().length === 0) {
      this.cargarPopulares(true); 
      return;
    }

    this.cargando = true;
    this.ultimoTerminoBuscado = valor; 

    if (this.filtroActivo === 'Año' && !isNaN(valor)) {
      this.tmdbService.buscarPorAnio(valor).subscribe({
        next: (resp) => { this.peliculas = resp.results; this.cargando = false; }
      });
    } else if (this.filtroActivo === 'Género') {
      const idEncontrado = this.tmdbService.getIdGenero(valor); 
      
      if (idEncontrado) {
        this.tmdbService.buscarPorGenero(idEncontrado).subscribe({
          next: (resp) => { this.peliculas = resp.results; this.cargando = false; }
        });
      } else {
        this.peliculas = []; 
        this.cargando = false;
      }
    } else if (this.filtroActivo === 'Director') {

      this.tmdbService.buscarPersona(valor).subscribe({
        next: (resp) => {
          if (resp.results && resp.results.length > 0) {
            const personId = resp.results[0].id;
            this.tmdbService.buscarPeliculasPorDirector(personId).subscribe({
              next: (peliResp) => { this.peliculas = peliResp.results; this.cargando = false; }
            });
          } else {
            this.peliculas = [];
            this.cargando = false;
          }
        },
        error: () => this.cargando = false
      });
    } else {
      this.ejecutarBusqueda(valor);
    }
  }

  /**
   * Ejecuta la búsqueda específica cuando el usuario selecciona una categoría
   * desde el menú desplegable nativo de géneros.
   * @param event - El evento del DOM que contiene el ID del género seleccionado.
   */
  onGeneroChange(event: any) {
    const idGenero = event.detail.value;
    if (!idGenero) return;

    this.idGeneroSeleccionado = idGenero;
    this.cargando = true;
    this.mostrandoPopulares = false;
    
    const generoObj = this.tmdbService.generosLista.find(g => g.id === idGenero);
    this.ultimoTerminoBuscado = generoObj ? generoObj.nombre : '';

    this.tmdbService.buscarPorGenero(idGenero).subscribe({
      next: (resp) => { this.peliculas = resp.results; this.cargando = false; },
      error: () => this.cargando = false
    });
  }

  /**
   * Obtiene el listado de películas en tendencia.
   * @param soloTop3 - Bandera que determina si se renderiza la lista completa o solo una vista previa abreviada.
   */
  cargarPopulares(soloTop3: boolean = false) {
    this.cargando = true;
    this.mostrandoPopulares = soloTop3;
    
    this.tmdbService.getPeliculasPopulares().subscribe({
      next: (resp) => {
        this.peliculas = soloTop3 ? resp.results.slice(0, 3) : resp.results;
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  /**
   * Intercepta la selección de un género a través de botones (si aplica en vistas secundarias)
   * y dispara la actualización de la lista de películas.
   * @param idGenero - El identificador numérico de TMDB para el género.
   * @param nombreGenero - El nombre legible del género para propósitos de UI.
   */
  seleccionarGeneroBoton(idGenero: number, nombreGenero: string) {  
    this.generoSeleccionado = nombreGenero;
    this.cargando = true;
    this.mostrandoPopulares = false;
    this.tmdbService.buscarPorGenero(idGenero).subscribe({
      next: (resp) => { this.peliculas = resp.results; this.cargando = false; },
      error: () => this.cargando = false
    });
  }

  /**
   * Despliega un componente de alerta nativo para informar al usuario
   * sobre fallos críticos, como la pérdida de conexión a internet.
   */
  async mostrarAlertaError() {
    const alert = await this.alertCtrl.create({
      header: 'Error de conexión',
      message: 'No pudimos cargar las películas. Revisa tu conexión a internet.',
      buttons: ['OK']
    });
    await alert.present();
  }

  /**
   * Alterna el estado de la vista entre un resumen de sugerencias (Top 3)
   * y el listado completo de resultados para el criterio actual.
   */
  toggleExpandir() {
    if (this.mostrandoPopulares) {
      if (this.filtroActivo === 'Género' && this.generoSeleccionado) {
        const id = this.tmdbService.getIdGenero(this.generoSeleccionado);
        if (id) {
          this.cargando = true;
          this.tmdbService.buscarPorGenero(id).subscribe({
            next: (resp) => { this.peliculas = resp.results; this.cargando = false; }
          });
        }
      } else {
        this.cargarPopulares(false); 
      }
      this.mostrandoPopulares = false;
    } else {
      this.cargarPopulares(true); 
      this.generoSeleccionado = '';
    }
  }

  /**
   * Actualiza la referencia de la película que el usuario desea inspeccionar
   * antes de abrir la vista de detalles.
   * @param peli - El objeto completo de la película seleccionada.
   */
  verDetalle(peli: Pelicula) {
    this.peliSeleccionada = peli;
  }

  /**
   * Guarda una película en el almacenamiento local del dispositivo (Watchlist).
   * Previene la inserción de duplicados mediante la verificación del ID.
   * @param peli - El objeto de la película a guardar.
   */
  async agregarAPendientes(peli: Pelicula) {
    if (!this.pendientes.find(p => p.id === peli.id)) {
      this.pendientes.push(peli);
      localStorage.setItem('watchlist', JSON.stringify(this.pendientes));
      console.log('Guardada en pendientes');

      const toast = await this.toastCtrl.create({
      message: `${peli.title} agregada a pendientes`,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    toast.present();
    }
  }

  /**
   * Dispara peticiones secundarias a la API para obtener créditos y plataformas,
   * y posteriormente despliega el modal interactivo con la información detallada.
   * @param peli - El objeto de la película que sirve como base para la consulta.
   */
  async abrirModal(peli: Pelicula) {
    this.peliSeleccionada = peli; 
    this.directorModal = 'Cargando...';
    this.plataformasModal = [];
    this.tmdbService.getDetallesPelicula(peli.id).subscribe((detalles) => {
      const director = detalles.credits.crew.find((c: any) => c.job === 'Director');
      this.directorModal = director ? director.name : 'Desconocido';

      if (detalles['watch/providers']?.results?.AR?.flatrate)  {
        this.plataformasModal = detalles['watch/providers'].results.AR.flatrate;
      }
    });

    await this.modal.present();
  }

  /**
   * Verifica de manera sincrónica si una película ya existe en el listado local de pendientes.
   * Utilizado principalmente para enlazar el estado visual de los botones en la UI.
   * @param peli - El objeto de la película a evaluar. Puede ser nulo.
   * @returns Verdadero si el ID de la película existe en el array local.
   */
  estaEnPendientes(peli: Pelicula | null): boolean {
    if (!peli) return false;
    // .some() devuelve true si encuentra al menos una peli con el mismo ID
    return this.pendientes.some(p => p.id === peli.id);
  }
}