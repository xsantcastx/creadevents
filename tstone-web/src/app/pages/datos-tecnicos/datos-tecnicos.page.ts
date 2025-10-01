import { Component } from '@angular/core';
import { DatosTecnicosComponent } from '../../features/datos-tecnicos/datos-tecnicos/datos-tecnicos';

@Component({
  selector: 'app-datos-tecnicos-page',
  standalone: true,
  imports: [DatosTecnicosComponent],
  templateUrl: './datos-tecnicos.page.html',
  styleUrl: './datos-tecnicos.page.scss'
})
export class DatosTecnicosPageComponent {}
