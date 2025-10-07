import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="body-dark py-16">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid md:grid-cols-4 gap-8 mb-12">
          
          <!-- Logo y descripción -->
          <div class="md:col-span-2">
            <div class="flex items-center gap-3 mb-4">
              <img src="/assets/topstone-mark-light.svg" alt="TopStone" class="h-8 w-auto"/>
              <span class="font-serif text-xl font-semibold text-ts-ink">TopStone</span>
            </div>
            <p class="text-ts-ink-soft mb-6 max-w-md">
              Superficies porcelánicas de gran formato que transforman espacios con diseño, 
              resistencia y versatilidad excepcionales.
            </p>
            <div class="flex gap-4">
              <a href="#" class="w-10 h-10 bg-ts-accent/20 rounded-full flex items-center justify-center text-ts-accent hover:bg-ts-accent hover:text-ts-bg transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" class="w-10 h-10 bg-ts-accent/20 rounded-full flex items-center justify-center text-ts-accent hover:bg-ts-accent hover:text-ts-bg transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                </svg>
              </a>
              <a href="#" class="w-10 h-10 bg-ts-accent/20 rounded-full flex items-center justify-center text-ts-accent hover:bg-ts-accent hover:text-ts-bg transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.052 0C6.507 0 2.005 4.502 2.005 10.047c0 4.434 2.897 8.202 6.906 9.527-.095-.847-.181-2.148.038-3.071.198-.833 1.281-5.429 1.281-5.429s-.327-.654-.327-1.62c0-1.518.881-2.652 1.975-2.652.932 0 1.383.699 1.383 1.537 0 .936-.597 2.337-.905 3.635-.258 1.089.546 1.977 1.621 1.977 1.946 0 3.444-2.053 3.444-5.015 0-2.623-1.885-4.457-4.575-4.457-3.115 0-4.943 2.337-4.943 4.753 0 .941.362 1.949.814 2.497.089.108.102.203.075.314-.082.34-.267 1.096-.303 1.249-.047.196-.153.237-.354.143-1.329-.618-2.161-2.56-2.161-4.123 0-3.354 2.436-6.434 7.027-6.434 3.689 0 6.556 2.628 6.556 6.146 0 3.668-2.314 6.622-5.523 6.622-1.078 0-2.094-.56-2.441-1.298l-.664 2.53c-.24.923-.889 2.081-1.324 2.787.997.308 2.055.472 3.154.472 5.545 0 10.047-4.502 10.047-10.047C22.099 4.502 17.597.001 12.052.001z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Enlaces rápidos -->
          <div>
            <h3 class="font-semibold text-ts-ink mb-4">Enlaces rápidos</h3>
            <ul class="space-y-2">
              <li><a routerLink="/" class="text-ts-ink-soft hover:text-ts-accent transition-colors">Inicio</a></li>
              <li><a routerLink="/productos" class="text-ts-ink-soft hover:text-ts-accent transition-colors">Productos</a></li>
              <li><a routerLink="/galeria" class="text-ts-ink-soft hover:text-ts-accent transition-colors">Galería</a></li>
              <li><a routerLink="/datos-tecnicos" class="text-ts-ink-soft hover:text-ts-accent transition-colors">Datos técnicos</a></li>
              <li><a routerLink="/contacto" class="text-ts-ink-soft hover:text-ts-accent transition-colors">Contacto</a></li>
            </ul>
          </div>

          <!-- Productos -->
          <div>
            <h3 class="font-semibold text-ts-ink mb-4">Productos</h3>
            <ul class="space-y-2">
              <li><a routerLink="/productos/12mm" class="text-ts-ink-soft hover:text-ts-accent transition-colors">Colección 12mm</a></li>
              <li><a routerLink="/productos/15mm" class="text-ts-ink-soft hover:text-ts-accent transition-colors">Colección 15mm</a></li>
              <li><a routerLink="/productos/20mm" class="text-ts-ink-soft hover:text-ts-accent transition-colors">Colección 20mm</a></li>
            </ul>
          </div>
        </div>

        <!-- Línea divisoria -->
        <div class="border-t border-ts-line pt-8">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-ts-ink-soft text-sm">
              © 2025 TopStone. Todos los derechos reservados.
            </p>
            <div class="flex gap-6 text-sm">
              <a href="#" class="text-ts-ink-soft hover:text-ts-accent transition-colors">Política de privacidad</a>
              <a href="#" class="text-ts-ink-soft hover:text-ts-accent transition-colors">Términos y condiciones</a>
              <a href="#" class="text-ts-ink-soft hover:text-ts-accent transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}