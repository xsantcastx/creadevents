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
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
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
  // Checkout Routes
  {
    path: 'checkout/review',
    loadComponent: () => import('./pages/checkout/checkout-review.page').then(m => m.CheckoutReviewPage),
    canActivate: [authGuard],
    title: 'TheLuxMining | Checkout Review'
  },
  {
    path: 'checkout/payment',
    loadComponent: () => import('./pages/checkout/payment.page').then(m => m.PaymentPage),
    canActivate: [authGuard],
    title: 'TheLuxMining | Payment'
  },
  {
    path: 'checkout/confirmation',
    loadComponent: () => import('./pages/checkout/confirmation.page').then(m => m.ConfirmationPage),
    canActivate: [authGuard],
    title: 'TheLuxMining | Order Confirmation'
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
    path: 'admin/products/quick-add',
    loadComponent: () => import('./pages/admin/products/quick-add-product.page').then(m => m.QuickAddProductComponent),
    canActivate: [adminGuard],
    title: 'TheLuxMining | Quick Add Product'
  },
  {
    path: 'admin/gallery',
    loadComponent: () => import('./pages/admin/gallery/gallery-admin.page').then(m => m.GalleryAdminComponent),
    canActivate: [adminGuard],
    title: 'TheLuxMining | Gallery Management'
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
    path: 'admin/analytics',
    loadComponent: () => import('./pages/admin/analytics/analytics-admin.page').then(m => m.AnalyticsAdminComponent),
    canActivate: [adminGuard],
    title: 'TheLuxMining | Analytics Dashboard'
  },
  {
    path: 'admin/settings',
    loadComponent: () => import('./pages/admin/settings/settings-admin.page').then(m => m.SettingsAdminComponent),
    canActivate: [adminGuard],
    title: 'TheLuxMining | Settings'
  },
  {
    path: 'admin/email-templates',
    loadComponent: () => import('./pages/admin/email-templates/email-templates-admin.page').then(m => m.EmailTemplatesAdminComponent),
    canActivate: [adminGuard],
    title: 'TheLuxMining | Email Templates'
  },
  {
    path: 'admin/size-groups',
    loadComponent: () => import('./pages/admin/size-groups/size-groups-admin.page').then(m => m.SizeGroupsAdminComponent),
    canActivate: [adminGuard],
    title: 'TheLuxMining | Size Groups Management'
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
