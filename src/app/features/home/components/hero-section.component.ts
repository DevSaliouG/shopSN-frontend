import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero">

      <!-- Background image -->
      <img
        src="/assets/images/hero-bg.jpg"
        alt=""
        class="hero-bg-img"
        loading="eager"
        width="1400"
        height="700"
      />

      <!-- Overlay gradient for text legibility -->
      <div class="hero-overlay"></div>

      <!-- Decorative blob top-right -->
      <div class="hero-blob"></div>

      <!-- Content -->
      <div class="hero-inner">
        <div class="hero-content">

          <!-- Badge -->
          <div class="hero-badge">
            <span class="badge-dot"></span>
            <span>Boutique en ligne au Sénégal</span>
          </div>

          <!-- Heading -->
          <h1 class="hero-title">
            Découvrez le meilleur<br />
            du <span class="hero-accent">shopping local</span>
          </h1>

          <!-- Description -->
          <p class="hero-desc">
            Des produits de qualité sélectionnés avec soin, livrés rapidement à Dakar
            et dans tout le Sénégal. Commandez facilement via WhatsApp.
          </p>

          <!-- CTA -->
          <div class="hero-actions">
            <a routerLink="/produits" class="btn-hero-primary">
              Explorer les produits
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
            <a routerLink="/produits" [queryParams]="{sort: 'populaire'}" class="btn-hero-ghost">
              Voir les tendances
            </a>
          </div>

          <!-- Stats -->
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-val">500+</span>
              <span class="stat-lbl">Produits</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-val">2K+</span>
              <span class="stat-lbl">Clients satisfaits</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-val">24h</span>
              <span class="stat-lbl">Livraison Dakar</span>
            </div>
          </div>

        </div>
      </div>

      <!-- Bottom trust badges -->
      <div class="hero-trust">
        <span class="trust-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5L20 7"/></svg>
          Paiement Wave / OM
        </span>
        <span class="trust-sep">·</span>
        <span class="trust-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5L20 7"/></svg>
          Livraison gratuite dès 50K
        </span>
        <span class="trust-sep">·</span>
        <span class="trust-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5L20 7"/></svg>
          Service client WhatsApp
        </span>
      </div>

    </section>
  `,
  styles: [`
    :host { display: block; }

    .hero {
      position: relative;
      min-height: 100svh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Background full-width image */
    .hero-bg-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 30%;
    }

    /* Dark gradient overlay — stronger at left for text, lighter at right */
    .hero-overlay {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(to right, rgba(8, 20, 30, 0.82) 0%, rgba(8, 20, 30, 0.55) 55%, rgba(8, 20, 30, 0.25) 100%),
        linear-gradient(to top, rgba(8, 20, 30, 0.6) 0%, transparent 50%);
    }

    /* Decorative tinted blob */
    .hero-blob {
      position: absolute;
      top: -120px;
      right: -120px;
      width: 480px;
      height: 480px;
      border-radius: 50%;
      background: rgba(45, 90, 76, 0.18);
      filter: blur(80px);
      pointer-events: none;
    }

    /* Main content wrapper */
    .hero-inner {
      position: relative;
      z-index: 2;
      flex: 1;
      display: flex;
      align-items: center;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 80px 24px 40px;
    }

    .hero-content {
      max-width: 600px;
    }

    /* Badge */
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: rgba(255, 255, 255, 0.92);
      font-size: 0.78rem;
      font-weight: 600;
      padding: 7px 16px;
      border-radius: 999px;
      margin-bottom: 28px;
    }

    .badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #4ADE80;
      animation: pulse-dot 2s ease-in-out infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.85); }
    }

    /* Title */
    .hero-title {
      font-size: clamp(2.2rem, 5vw, 3.75rem);
      font-weight: 900;
      line-height: 1.07;
      letter-spacing: -0.03em;
      color: #fff;
      margin: 0 0 22px;
    }

    .hero-accent {
      color: #6EE7B7;
      position: relative;
    }

    /* Description */
    .hero-desc {
      font-size: clamp(0.95rem, 1.5vw, 1.1rem);
      color: rgba(255, 255, 255, 0.78);
      line-height: 1.7;
      margin: 0 0 36px;
      max-width: 480px;
    }

    /* Actions */
    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 48px;
    }

    .btn-hero-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #2D5A4C;
      color: #fff;
      font-size: 0.9rem;
      font-weight: 700;
      padding: 15px 28px;
      border-radius: 999px;
      text-decoration: none;
      transition: background 0.2s, transform 0.18s, box-shadow 0.2s;
      box-shadow: 0 6px 24px rgba(45, 90, 76, 0.4);
    }

    .btn-hero-primary:hover {
      background: #1E3D33;
      transform: translateY(-2px);
      box-shadow: 0 10px 32px rgba(45, 90, 76, 0.5);
    }

    .btn-hero-ghost {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(8px);
      border: 1.5px solid rgba(255, 255, 255, 0.28);
      color: #fff;
      font-size: 0.9rem;
      font-weight: 600;
      padding: 14px 26px;
      border-radius: 999px;
      text-decoration: none;
      transition: background 0.2s, border-color 0.2s;
    }

    .btn-hero-ghost:hover {
      background: rgba(255, 255, 255, 0.18);
      border-color: rgba(255, 255, 255, 0.45);
    }

    /* Stats */
    .hero-stats {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-val {
      font-size: 1.6rem;
      font-weight: 900;
      color: #fff;
      letter-spacing: -0.04em;
      line-height: 1;
    }

    .stat-lbl {
      font-size: 0.72rem;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .stat-divider {
      width: 1px;
      height: 36px;
      background: rgba(255, 255, 255, 0.18);
    }

    /* Trust bar bottom */
    .hero-trust {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 8px 16px;
      padding: 16px 24px;
      background: rgba(8, 20, 30, 0.45);
      backdrop-filter: blur(12px);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .trust-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.82);
    }

    .trust-item svg { color: #4ADE80; flex-shrink: 0; }
    .trust-sep { color: rgba(255, 255, 255, 0.25); }

    /* Responsive */
    @media (max-width: 768px) {
      .hero { min-height: 90svh; }
      .hero-inner { padding: 100px 20px 32px; align-items: flex-end; }
      .hero-content { max-width: 100%; }
      .hero-overlay {
        background:
          linear-gradient(to bottom, rgba(8, 20, 30, 0.35) 0%, rgba(8, 20, 30, 0.85) 100%);
      }
      .hero-stats { gap: 16px; }
      .stat-val { font-size: 1.3rem; }
    }

    @media (max-width: 480px) {
      .hero-actions { flex-direction: column; }
      .btn-hero-primary, .btn-hero-ghost { justify-content: center; }
      .hero-trust { gap: 6px 12px; }
      .trust-sep { display: none; }
    }

    @media (prefers-reduced-motion: reduce) {
      .badge-dot { animation: none; }
    }
  `]
})
export class HeroSectionComponent {}
