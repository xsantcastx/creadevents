import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService, Producto } from '../../core/services/data.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss'
})
export class HomePageComponent implements OnInit {
  productos12mm: Producto[] = [];
  productos15mm: Producto[] = [];
  productos20mm: Producto[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadProductos();
  }

  private loadProductos() {
    this.dataService.getProductos().subscribe(data => {
      this.productos12mm = this.dataService.getProductosByGrosor(data.items, '12mm').slice(0, 4);
      this.productos15mm = this.dataService.getProductosByGrosor(data.items, '15mm').slice(0, 3);
      this.productos20mm = this.dataService.getProductosByGrosor(data.items, '20mm').slice(0, 4);
    });
  }
}
