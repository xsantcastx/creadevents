import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePageComponent),
    title: 'TopStone | Superficies Porcelánicas de Gran Formato'
  },
  {
    path: 'productos',
    loadComponent: () => import('./pages/productos/productos.page').then(m => m.ProductosPageComponent),
    title: 'TopStone | Productos'
  },
  {
    path: 'productos/:grosor',
    loadComponent: () => import('./pages/productos/grosor/grosor.component').then(m => m.GrosorComponent),
    title: 'TopStone | Productos por Grosor'
  },
  {
    path: 'productos/:grosor/:slug',
    loadComponent: () => import('./pages/productos/detalle/detalle.component').then(m => m.DetalleComponent),
    title: 'TopStone | Detalle de Producto'
  },
  {
    path: 'galeria',
    loadComponent: () => import('./pages/galeria/galeria.page').then(m => m.GaleriaPageComponent),
    title: 'TopStone | Galería de Proyectos'
  },
  {
    path: 'datos-tecnicos',
    loadComponent: () => import('./pages/datos-tecnicos/datos-tecnicos.page').then(m => m.DatosTecnicosPageComponent),
    title: 'TopStone | Datos Técnicos'
  },
  {
    path: 'contacto',
    loadComponent: () => import('./pages/contacto/contacto.page').then(m => m.ContactoPageComponent),
    title: 'TopStone | Contacto'
  },
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found.page').then(m => m.NotFoundPageComponent),
    title: 'TopStone | Página no encontrada'
  },
  {
    path: '**',
    redirectTo: '404'
  }
];
