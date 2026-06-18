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
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L6 12v16l14 8 14-8V12L20 4z" fill="currentColor" opacity="0.15"/>
                <path d="M20 8l-10 6v12l10 6 10-6V14L20 8z" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M15 18h10v8H15z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                <path d="M18 18v-2a2 2 0 0 1 4 0v2" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
              </svg>
              <span>Shop<em>SN</em></span>
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
              <li><a routerLink="/produits">Catalogue</a></li>
              <li><a routerLink="/a-propos">A propos</a></li>
              <li><a routerLink="/contact">Contact</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Assistance</h4>
            <ul>
              <li><a routerLink="/faq">FAQ</a></li>
              <li><a routerLink="/mentions-legales">Mentions legales</a></li>
              <li><a routerLink="/cgv">CGV</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Contact</h4>
            <ul class="contact-list">
              <li>
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>+221 70 007 88 22</span>
              </li>
              <li>
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>contact&#64;shopsn.sn</span>
              </li>
              <li>
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Dakar, Senegal</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <span>&copy; {{ currentYear }} ShopSN — Tous droits reserves</span>
          <span class="footer-made">Fait avec soin au Senegal</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #1E2A36;
      color: rgba(255, 255, 255, 0.8);
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
        gap: 32px;
      }
      .footer-bottom {
        flex-direction: column;
        gap: 8px;
        text-align: center;
      }
    }

    @media (max-width: 480px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 28px;
      }
      .footer-container {
        padding: 48px 16px 20px;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
