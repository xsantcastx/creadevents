import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <!-- Header -->
    <section class="py-20 lg:py-28 body-dark">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <div class="max-w-2xl mx-auto">
          <!-- Error Number -->
          <div class="font-serif text-8xl lg:text-9xl text-ts-accent font-bold mb-4">
            404
          </div>
          
          <!-- Title -->
          <h1 class="font-serif text-4xl lg:text-5xl text-ts-ink mb-6">
            {{ 'notfound.title' | translate }}
          </h1>
          
          <!-- Description -->
          <p class="text-xl text-ts-ink-soft mb-8 max-w-xl mx-auto">
            {{ 'notfound.description' | translate }}
          </p>
          
          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/" 
               class="inline-flex items-center justify-center px-8 py-4 bg-ts-accent text-ts-bg font-semibold rounded-lg hover:bg-ts-accent/90 transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              {{ 'notfound.go_home' | translate }}
            </a>
            
            <a routerLink="/productos" 
               class="inline-flex items-center justify-center px-8 py-4 border-2 border-ts-accent text-ts-accent font-semibold rounded-lg hover:bg-ts-accent hover:text-ts-bg transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              {{ 'notfound.view_products' | translate }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Helpful Links Section -->
    <section class="py-16 bg-ts-paper">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-12">
          <h2 class="font-serif text-3xl text-ts-bg mb-4">{{ 'notfound.looking_for' | translate }}</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            {{ 'notfound.explore_sections' | translate }}
          </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Home -->
          <a routerLink="/" 
             class="group p-6 bg-white rounded-2xl shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-12 h-12 bg-ts-accent/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-ts-accent/30 transition-colors">
              <svg class="w-6 h-6 text-ts-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
            </div>
            <h3 class="font-serif text-xl text-ts-bg mb-2">{{ 'notfound.links.home_title' | translate }}</h3>
            <p class="text-gray-600">{{ 'notfound.links.home_desc' | translate }}</p>
          </a>
          
          <!-- Products -->
          <a routerLink="/productos" 
             class="group p-6 bg-white rounded-2xl shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-12 h-12 bg-ts-accent/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-ts-accent/30 transition-colors">
              <svg class="w-6 h-6 text-ts-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <h3 class="font-serif text-xl text-ts-bg mb-2">{{ 'notfound.links.products_title' | translate }}</h3>
            <p class="text-gray-600">{{ 'notfound.links.products_desc' | translate }}</p>
          </a>
          
          <!-- Contact -->
          <a routerLink="/contacto" 
             class="group p-6 bg-white rounded-2xl shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div class="w-12 h-12 bg-ts-accent/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-ts-accent/30 transition-colors">
              <svg class="w-6 h-6 text-ts-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 class="font-serif text-xl text-ts-bg mb-2">{{ 'notfound.links.contact_title' | translate }}</h3>
            <p class="text-gray-600">{{ 'notfound.links.contact_desc' | translate }}</p>
          </a>
        </div>
      </div>
    </section>
  `,
  styleUrl: './not-found.page.scss'
})
export class NotFoundPageComponent {

}