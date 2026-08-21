/**
 * Page À propos — ShopSN
 * Présentation de la marque, histoire, valeurs et avantages
 *
 * Fonctionnalités:
 * - Hero section pleine largeur
 * - Section histoire avec statistiques
 * - Valeurs de l'entreprise (4 cartes)
 * - Avantages plateforme (6 features)
 * - CTA final vers catalogue
 * - Animations au scroll
 * - Responsive design mobile-first
 */

import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    // SEO Meta tags
    this.seoService.setBasicMeta({
      title: 'À propos de ShopSN - Commerce en ligne au Sénégal',
      description: 'Découvrez ShopSN, la plateforme e-commerce sénégalaise qui connecte directement les acheteurs aux vendeurs via WhatsApp. Simplicité, proximité et confiance.',
      keywords: 'à propos shopsn, e-commerce sénégal, plateforme shopping dakar, whatsapp commerce, boutique en ligne sénégalaise',
      type: 'website'
    });

    this.seoService.setOpenGraphMeta({
      title: 'À propos de ShopSN',
      description: 'La plateforme e-commerce qui révolutionne le commerce en ligne au Sénégal avec WhatsApp.',
      type: 'website'
    });

    this.seoService.setTwitterCard({
      title: 'À propos de ShopSN',
      description: 'La plateforme e-commerce qui révolutionne le commerce en ligne au Sénégal avec WhatsApp.'
    });
  }
}
