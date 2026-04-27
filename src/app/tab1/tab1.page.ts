import { Component } from '@angular/core';
import { Peliculas } from '../../app/peliculas';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  listaPeliculas: any;

  constructor(
    public peliculas: Peliculas
  ) {

  }

  // logica
  ngOnInit() {
    this.ionViewDidLoad()
  }

  ionViewDidLoad() {
    this.peliculas.obtenerDestacados()
      .subscribe({
        next: (data) => {
          this.listaPeliculas = data;
          this.listaPeliculas = this.listaPeliculas.results;

          console.log(this.listaPeliculas);
        },
        error: (error) => {
          console.log(error);
        }
      })
  }

}
