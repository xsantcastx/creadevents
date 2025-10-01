import { Component } from '@angular/core';
import { HomeHeroComponent } from '../../features/home/home-hero/home-hero';
import { ColeccionesDestacadasComponent } from '../../features/home/colecciones-destacadas/colecciones-destacadas';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [HomeHeroComponent, ColeccionesDestacadasComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss'
})
export class HomePageComponent {}
