import { Component } from '@angular/core';
import { GaleriaComponent } from '../../features/galeria/galeria/galeria';

@Component({
  selector: 'app-galeria-page',
  standalone: true,
  imports: [GaleriaComponent],
  templateUrl: './galeria.page.html',
  styleUrl: './galeria.page.scss'
})
export class GaleriaPageComponent {}
