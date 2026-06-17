import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="bg-gray-900 text-gray-300 mt-auto">
      <div class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Colonne 1 : Infos boutique -->
          <div>
            <h3 class="text-white font-bold text-lg mb-4">ShopSN</h3>
            <p class="text-sm">Boutique en ligne Sénégal – Achetez facilement via WhatsApp.</p>
            <p class="text-sm mt-2">Livraison rapide sur Dakar et toute la région.</p>
          </div>

          <!-- Colonne 2 : Liens rapides -->
          <div>
            <h4 class="text-white font-semibold mb-4">Liens rapides</h4>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/" class="hover:text-white transition">Accueil</a></li>
              <li><a routerLink="/produits" class="hover:text-white transition">Catalogue</a></li>
              <li><a routerLink="/contact" class="hover:text-white transition">Contact</a></li>
              <li><a routerLink="/a-propos" class="hover:text-white transition">À propos</a></li>
            </ul>
          </div>

          <!-- Colonne 3 : Assistance -->
          <div>
            <h4 class="text-white font-semibold mb-4">Assistance</h4>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/faq" class="hover:text-white transition">FAQ</a></li>
              <li><a routerLink="/mentions-legales" class="hover:text-white transition">Mentions légales</a></li>
              <li><a routerLink="/cgv" class="hover:text-white transition">CGV</a></li>
            </ul>
          </div>

          <!-- Colonne 4 : Contact & Réseaux -->
          <div>
            <h4 class="text-white font-semibold mb-4">Contact</h4>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>+221 70 007 88 22</span>
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polygon points="22,6 12,13 2,6"/></svg>
                <span>contact@shopsn.sn</span>
              </li>
            </ul>
            <div class="flex gap-4 mt-4">
              <a href="#" class="hover:text-white transition" aria-label="Facebook">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" class="hover:text-white transition" aria-label="Instagram">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.05 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772c-.556.555-1.112.899-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.05-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.247-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.218-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772c.556-.555 1.112-.899 1.772-1.153.637-.247 1.363-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-800 mt-6 pt-6 text-center text-sm">
          &copy; {{ currentYear }} ShopSN – Tous droits réservés.
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}