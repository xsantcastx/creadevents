import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home.page';
import { ProductosPageComponent } from './pages/productos/productos.page';
import { GaleriaPageComponent } from './pages/galeria/galeria.page';
import { DatosTecnicosPageComponent } from './pages/datos-tecnicos/datos-tecnicos.page';
import { ContactoPageComponent } from './pages/contacto/contacto.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    title: 'The Stone | Inicio'
  },
  {
    path: 'productos',
    component: ProductosPageComponent,
    title: 'The Stone | Productos'
  },
  {
    path: 'galeria',
    component: GaleriaPageComponent,
    title: 'The Stone | Galeria'
  },
  {
    path: 'datos-tecnicos',
    component: DatosTecnicosPageComponent,
    title: 'The Stone | Datos tecnicos'
  },
  {
    path: 'contacto',
    component: ContactoPageComponent,
    title: 'The Stone | Contacto'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
