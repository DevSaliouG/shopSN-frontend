import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GtmService } from '../../../core/services/gtm.service';

/**
 * Composant Cookie Consent RGPD
 * Demande le consentement avant d'activer les cookies analytics
 */
@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showBanner()) {
      <div class="cookie-consent" role="dialog" aria-label="Consentement cookies">
        <div class="cookie-content">
          <div class="cookie-text">
            <h3 class="cookie-title">🍪 Cookies et confidentialité</h3>
            <p class="cookie-description">
              Nous utilisons des cookies pour analyser notre trafic et améliorer votre expérience.
              Vos données sont anonymisées et ne sont jamais partagées avec des tiers.
            </p>
          </div>

          <div class="cookie-actions">
            <button
              (click)="acceptAll()"
              class="btn-accept"
              aria-label="Accepter tous les cookies"
            >
              Tout accepter
            </button>
            <button
              (click)="acceptNecessary()"
              class="btn-necessary"
              aria-label="Accepter uniquement les cookies nécessaires"
            >
              Nécessaires uniquement
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .cookie-consent {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: var(--z-modal, 500);
      background: rgba(17, 24, 39, 0.98);
      backdrop-filter: blur(8px);
      border-top: 2px solid #F97316;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }

    .cookie-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1.5rem;
    }

    .cookie-text {
      flex: 1;
      min-width: 300px;
    }

    .cookie-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: white;
      margin: 0 0 0.5rem;
    }

    .cookie-description {
      font-size: 0.9rem;
      color: #D1D5DB;
      margin: 0;
      line-height: 1.5;
    }

    .cookie-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn-accept,
    .btn-necessary {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      white-space: nowrap;
    }

    .btn-accept {
      background: #F97316;
      color: white;
    }

    .btn-accept:hover {
      background: #EA580C;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
    }

    .btn-necessary {
      background: transparent;
      color: #D1D5DB;
      border: 1px solid #4B5563;
    }

    .btn-necessary:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: #6B7280;
    }

    @media (max-width: 768px) {
      .cookie-content {
        flex-direction: column;
        align-items: stretch;
      }

      .cookie-actions {
        flex-direction: column;
      }

      .btn-accept,
      .btn-necessary {
        width: 100%;
      }
    }
  `]
})
export class CookieConsentComponent {
  private platformId = inject(PLATFORM_ID);
  private gtm = inject(GtmService);

  showBanner = signal(false);
  private readonly CONSENT_KEY = 'dkronlinestore_cookie_consent';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkConsent();
    }
  }

  private checkConsent(): void {
    const consent = localStorage.getItem(this.CONSENT_KEY);

    if (!consent) {
      // Aucun consentement → afficher banner
      this.showBanner.set(true);
    } else if (consent === 'all') {
      // Consentement complet → activer analytics
      this.gtm.init();
    }
    // Si 'necessary', ne rien faire (pas d'analytics)
  }

  acceptAll(): void {
    localStorage.setItem(this.CONSENT_KEY, 'all');
    this.showBanner.set(false);

    // Activer analytics
    this.gtm.init();

    // Track le consentement
    this.gtm.pushEvent({
      event: 'cookie_consent',
      consent_type: 'all',
    });
  }

  acceptNecessary(): void {
    localStorage.setItem(this.CONSENT_KEY, 'necessary');
    this.showBanner.set(false);

    // Ne pas activer analytics
    console.log('[Cookie] Consentement minimal uniquement');
  }
}
