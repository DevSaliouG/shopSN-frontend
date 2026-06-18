import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-[#E8EDF2] py-16">
      <div class="container mx-auto px-4 max-w-4xl">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-sans font-bold text-[#2D5A4C] mb-4">A propos de ShopSN</h1>
          <p class="text-gray-600 max-w-2xl mx-auto">
            La première boutique en ligne sénégalaise qui vous connecte directement aux vendeurs via WhatsApp.
          </p>
        </div>

        <div class="space-y-12">
          <!-- Mission -->
          <section class="bg-white rounded-2xl p-8 shadow-sm shadow-sm">
            <h2 class="text-2xl font-sans font-bold text-[#2D5A4C] mb-4">Notre Mission</h2>
            <p class="text-gray-600 leading-relaxed">
              ShopSN a pour mission de rendre le commerce en ligne accessible à tous les Sénégalais.
              Nous connectons les acheteurs aux vendeurs locaux de manière simple et directe,
              en utilisant WhatsApp comme canal de communication principal.
              Pas besoin de carte bancaire, pas de processus compliqué — juste un message et c'est fait.
            </p>
          </section>

          <!-- Valeurs -->
          <section>
            <h2 class="text-2xl font-sans font-bold text-[#2D5A4C] mb-6 text-center">Nos Valeurs</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-white rounded-2xl p-6 text-center shadow-sm shadow-sm">
                <div class="w-14 h-14 bg-[#DFE5EC] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg class="w-7 h-7 text-[#2D5A4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <h3 class="font-semibold text-[#2D5A4C] mb-2">Proximité</h3>
                <p class="text-sm text-gray-600">Nous favorisons le commerce local et les échanges directs entre Sénégalais.</p>
              </div>
              <div class="bg-white rounded-2xl p-6 text-center shadow-sm shadow-sm">
                <div class="w-14 h-14 bg-[#DFE5EC] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg class="w-7 h-7 text-[#2D5A4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <h3 class="font-semibold text-[#2D5A4C] mb-2">Confiance</h3>
                <p class="text-sm text-gray-600">Chaque vendeur est vérifié pour garantir des transactions sûres et fiables.</p>
              </div>
              <div class="bg-white rounded-2xl p-6 text-center shadow-sm shadow-sm">
                <div class="w-14 h-14 bg-[#DFE5EC] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg class="w-7 h-7 text-[#2D5A4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <h3 class="font-semibold text-[#2D5A4C] mb-2">Simplicité</h3>
                <p class="text-sm text-gray-600">Commandez en un clic via WhatsApp, sans inscription obligatoire ni processus complexe.</p>
              </div>
            </div>
          </section>

          <!-- CTA -->
          <section class="text-center bg-[#2D5A4C] rounded-2xl p-10 text-white">
            <h2 class="text-2xl font-bold mb-4">Prêt à découvrir nos produits ?</h2>
            <p class="text-white/70 mb-6">Parcourez notre catalogue et commandez facilement via WhatsApp.</p>
            <a routerLink="/produits" class="inline-block bg-white text-[#2D5A4C] font-semibold px-8 py-3 rounded-full hover:shadow-lg transition-all">
              Voir les produits
            </a>
          </section>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent {}
