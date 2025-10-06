import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService, Producto } from '../../services/data.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  scrolled = false;
  mobileMenuOpen = false;
  productos: Producto[] = [];
  hoverPreviewUrl = '/assets/Modern/image2.jpeg';
  private destroy$ = new Subject<void>();

  productos12mm: Producto[] = [];
  productos15mm: Producto[] = [];
  productos20mm: Producto[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadProductos();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.scrolled = window.pageYOffset > 50;
  }

  private loadProductos() {
    this.dataService.getProductos()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.productos = data.items;
        this.productos12mm = this.dataService.getProductosByGrosor(this.productos, '12mm');
        this.productos15mm = this.dataService.getProductosByGrosor(this.productos, '15mm');
        this.productos20mm = this.dataService.getProductosByGrosor(this.productos, '20mm');
      });
  }

  onProductHover(producto: Producto) {
    this.hoverPreviewUrl = producto.cover;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}