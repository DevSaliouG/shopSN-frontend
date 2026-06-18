import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-[#E8EDF2] flex items-center justify-center px-4">
      <div class="text-center max-w-md">
        <div class="mb-8">
          <span class="text-8xl font-sans font-bold text-[#2D5A4C]">404</span>
        </div>
        <h1 class="text-2xl font-bold text-[#2D5A4C] mb-4">Page introuvable</h1>
        <p class="text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/"
            class="px-6 py-3 bg-[#2D5A4C] hover:bg-[#1E3D33] text-white font-medium rounded-xl transition-colors">
            Retour à l'accueil
          </a>
          <a routerLink="/produits"
            class="px-6 py-3 border-2 border-[#2D5A4C] text-[#2D5A4C] hover:bg-[#E8EDF2] font-medium rounded-xl transition-colors">
            Voir les produits
          </a>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {}
