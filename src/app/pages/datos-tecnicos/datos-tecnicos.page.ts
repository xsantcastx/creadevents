import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, DatosTecnicosData } from '../../core/services/data.service';

@Component({
  selector: 'app-datos-tecnicos-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './datos-tecnicos.page.html',
  styleUrl: './datos-tecnicos.page.scss'
})
export class DatosTecnicosPageComponent implements OnInit {
  datosTecnicos: DatosTecnicosData | null = null;
  acordeonesAbiertos: { [key: string]: boolean } = {
    acabados: false,
    fichas: false,
    especificaciones: true,
    packing: false,
    bordes: false,
    fijaciones: false,
    mantenimiento: false
  };

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadDatosTecnicos();
  }

  private loadDatosTecnicos() {
    this.dataService.getDatosTecnicos().subscribe(data => {
      this.datosTecnicos = data;
    });
  }

  toggleAcordeon(seccion: string) {
    this.acordeonesAbiertos[seccion] = !this.acordeonesAbiertos[seccion];
  }

  formatearTexto(texto: string): string {
    return texto.replace(/([A-Z])/g, ' $1').trim();
  }
}
