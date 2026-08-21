import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo">
              <img src="/assets/images/logo.jpeg" alt="DkrOnlineStore" width="36" height="36" style="border-radius:8px;object-fit:cover;flex-shrink:0;" />
              <span>Dkr<em>OnlineStore</em></span>
            </div>
            <p class="footer-desc">Votre boutique en ligne au Senegal. Commandez facilement via WhatsApp avec livraison rapide sur Dakar et ses environs.</p>
            <div class="social-links">
              <a href="#" aria-label="Facebook">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.05 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772c-.556.555-1.112.899-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.05-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.247-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.218-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772c.556-.555 1.112-.899 1.772-1.153.637-.247 1.363-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg>
              </a>
              <a href="#" aria-label="WhatsApp">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
              </a>
            </div>
          </div>

          <div class="footer-col">
            <h4>Navigation</h4>
            <ul>
              <li><a routerLink="/">Accueil</a></li>
              <li><a routerLink="/produits">Catalogue produits</a></li>
              <li><a routerLink="/a-propos">A propos de nous</a></li>
              <li><a routerLink="/contact">Nous contacter</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Catégories</h4>
            <ul>
              <li><a routerLink="/produits" [queryParams]="{sort: 'recent'}">Nouveautés</a></li>
              <li><a routerLink="/produits" [queryParams]="{sort: 'popular'}">Populaires</a></li>
              <li><a routerLink="/produits" [queryParams]="{en_stock: 'true'}">En stock</a></li>
              <li><a routerLink="/produits" [queryParams]="{sort: 'price_asc'}">Promotions</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Informations</h4>
            <ul>
              <li><a routerLink="/livraison">Livraison Dakar</a></li>
              <li><a routerLink="/paiement">Modes de paiement</a></li>
              <li><a routerLink="/faq">Questions fréquentes</a></li>
              <li><a routerLink="/cgv">Conditions de vente</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Contact</h4>
            <ul class="contact-list">
              <li>
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>+221 78 783 80 02</span>
              </li>
              <li>
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>contact&#64;dkronlinestore.sn</span>
              </li>
              <li>
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Dakar, Senegal</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Mots-clés SEO pour maillage interne -->
        <div class="footer-seo">
          <p class="footer-seo-text">
            <strong>DkrOnlineStore</strong> - Votre boutique en ligne à <strong>Dakar</strong>, <strong>Sénégal</strong>.
            Achetez facilement via <strong>WhatsApp</strong>. Paiement <strong>Orange Money</strong>, <strong>Wave</strong>, espèces.
            <strong>Livraison rapide Dakar</strong> et environs. Large choix de produits.
            E-commerce fiable au Sénégal. Shopping en ligne sécurisé.
          </p>
        </div>

        <div class="footer-bottom">
          <span>&copy; {{ currentYear }} DkrOnlineStore — Tous droits reserves</span>
          <span class="footer-made">Fait avec soin au Senegal 🇸🇳</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #1E2A36;
      color: rgba(255, 255, 255, 0.8);
      position: relative;
      z-index: var(--z-base, 0);
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 64px 24px 24px;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
      gap: 48px;
      margin-bottom: 48px;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      margin-bottom: 16px;

      span {
        font-size: 1.3rem;
        font-weight: 800;
        letter-spacing: -0.02em;
      }

      em {
        font-style: normal;
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .footer-desc {
      font-size: 0.875rem;
      line-height: 1.7;
      opacity: 0.6;
      margin-bottom: 24px;
    }

    .social-links {
      display: flex;
      gap: 10px;

      a {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.06);
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.5);
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.12);
          color: white;
          transform: translateY(-2px);
        }
      }
    }

    .footer-col h4 {
      color: white;
      font-weight: 600;
      font-size: 0.85rem;
      margin-bottom: 16px;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .footer-col ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-col li {
      margin-bottom: 10px;
    }

    .footer-col a {
      color: rgba(255, 255, 255, 0.55);
      text-decoration: none;
      font-size: 0.85rem;
      transition: all 0.2s ease;

      &:hover {
        color: white;
        padding-left: 4px;
      }
    }

    .contact-list li {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.55);
    }

    .footer-seo {
      margin: 32px 0 24px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .footer-seo-text {
      font-size: 0.8rem;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.4);
      margin: 0;
      text-align: center;

      strong {
        color: rgba(255, 255, 255, 0.7);
        font-weight: 500;
      }
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      opacity: 0.5;
    }

    .footer-made {
      color: rgba(255, 255, 255, 0.6);
    }

    @media (max-width: 768px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 28px;
      }
      .footer-bottom {
        flex-direction: column;
        gap: 8px;
        text-align: center;
      }
      .footer-container {
        padding: 48px 20px 20px;
      }
    }

    @media (max-width: 480px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }
      .footer-container {
        padding: 40px 16px 16px;
      }
      .footer-logo span {
        font-size: 1.1rem;
      }
      .footer-desc {
        font-size: 0.8125rem;
      }
      .footer-col h4 {
        font-size: 0.8rem;
      }
      .footer-col a {
        font-size: 0.8rem;
      }
      .contact-list li {
        font-size: 0.8rem;
      }
      .footer-seo {
        padding: 16px;
        margin: 24px 0 16px;
      }
      .footer-seo-text {
        font-size: 0.75rem;
      }
      .footer-bottom {
        font-size: 0.75rem;
      }
    }

    @media (max-width: 360px) {
      .footer-container {
        padding: 32px 12px 12px;
      }
      .footer-logo {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      .social-links a {
        width: 34px;
        height: 34px;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
