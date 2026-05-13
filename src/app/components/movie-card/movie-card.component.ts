import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
})
export class MovieCardComponent implements OnInit {

  @Input() pelicula: any;

  imageBase = 'https://image.tmdb.org/t/p/w500';

  getRating(valor: number): string {
    return valor ? valor.toFixed(1) : '0.0';
  }

  constructor() { }

  ngOnInit() { }

}
