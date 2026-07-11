import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div class="text-center max-w-md">
        <div class="mb-8">
          <span class="text-8xl font-sans font-bold text-[#FF6600]">404</span>
        </div>
        <h1 class="text-2xl font-bold text-[#FF6600] mb-4">Page introuvable</h1>
        <p class="text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/"
            class="px-6 py-3 bg-[#FF6600] hover:bg-[#E65500] text-white font-medium rounded-xl transition-colors">
            Retour à l'accueil
          </a>
          <a routerLink="/produits"
            class="px-6 py-3 border-2 border-[#FF6600] text-[#FF6600] hover:bg-[#F5F5F5] font-medium rounded-xl transition-colors">
            Voir les produits
          </a>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {}
