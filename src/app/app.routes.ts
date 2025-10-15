import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePageComponent),
    title: 'TheLuxMining | Premium Bitcoin Mining Hardware'
  },
  {
    path: 'productos',
    loadComponent: () => import('./pages/productos/productos.page').then(m => m.ProductosPageComponent),
    title: 'TheLuxMining | Mining Products'
  },
  {
    path: 'products/:category',
    loadComponent: () => import('./pages/productos/grosor/grosor.component').then(m => m.GrosorComponent),
    title: 'TheLuxMining | Mining Hardware by Category'
  },
  {
    path: 'products/:category/:slug',
    loadComponent: () => import('./pages/productos/detalle/detalle.component').then(m => m.DetalleComponent),
    title: 'TheLuxMining | Product Details'
  },
  {
    path: 'galeria',
    loadComponent: () => import('./pages/galeria/galeria.page').then(m => m.GaleriaPageComponent),
    title: 'TheLuxMining | Gallery'
  },
  {
    path: 'contacto',
    loadComponent: () => import('./pages/contacto/contacto.page').then(m => m.ContactoPageComponent),
    title: 'TheLuxMining | Contact'
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.page').then(m => m.CartPage),
    title: 'TheLuxMining | Shopping Cart'
  },
  // Client Area Routes
  {
    path: 'client/login',
    loadComponent: () => import('./pages/client/login/login.page').then(m => m.LoginPageComponent),
    title: 'TheLuxMining | Login'
  },
  {
    path: 'client/register',
    loadComponent: () => import('./pages/client/register/register.page').then(m => m.RegisterPageComponent),
    title: 'TheLuxMining | Register'
  },
  {
    path: 'client/profile',
    loadComponent: () => import('./pages/client/profile/profile.page').then(m => m.ProfilePageComponent),
    canActivate: [authGuard],
    title: 'TheLuxMining | My Profile'
  },
  {
    path: 'client/orders',
    loadComponent: () => import('./pages/client/orders/orders.page').then(m => m.OrdersPageComponent),
    canActivate: [authGuard],
    title: 'TheLuxMining | My Orders'
  },
  // Admin Panel Routes
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/dashboard/dashboard.page').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard],
    title: 'TheLuxMining | Admin Dashboard'
  },
  {
    path: 'admin/products',
    loadComponent: () => import('./pages/admin/products/products-admin.page').then(m => m.ProductsAdminComponent),
    canActivate: [adminGuard],
    title: 'TheLuxMining | Product Management'
  },
  {
    path: 'admin/gallery',
    loadComponent: () => import('./pages/admin/gallery/gallery-admin.page').then(m => m.GalleryAdminComponent),
    canActivate: [adminGuard],
    title: 'TheLuxMining | Gallery Management'
  },
  {
    path: 'admin/catalog',
    loadComponent: () => import('./pages/admin/catalog/catalog-admin.page').then(m => m.CatalogAdminComponent),
    canActivate: [adminGuard],
    title: 'TheLuxMining | Catalog Management'
  },
  {
    path: 'admin/orders',
    loadComponent: () => import('./pages/admin/orders/orders-admin.page').then(m => m.OrdersAdminComponent),
    canActivate: [adminGuard],
    title: 'TheLuxMining | Order Management'
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./pages/admin/users/users-admin.page').then(m => m.UsersAdminComponent),
    canActivate: [adminGuard],
    title: 'TheLuxMining | User Management'
  },
  {
    path: 'admin/benefit-templates',
    loadComponent: () => import('./pages/admin/benefit-templates/benefit-templates-admin.page').then(m => m.BenefitTemplatesAdminComponent),
    canActivate: [adminGuard],
    title: 'TheLuxMining | Benefit Templates'
  },
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found.page').then(m => m.NotFoundPageComponent),
    title: 'TheLuxMining | Page Not Found'
  },
  {
    path: '**',
    redirectTo: '404'
  }
];
