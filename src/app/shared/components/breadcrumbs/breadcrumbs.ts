import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta } from '@angular/platform-browser';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  active?: boolean;
}

@Component({
  selector: 'app-breadcrumbs',
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumbs.html',
  styleUrl: './breadcrumbs.css',
})
export class Breadcrumbs implements OnInit, OnDestroy {
  @Input() items: BreadcrumbItem[] = [];
  @Input() showHome: boolean = true;

  private meta = inject(Meta);
  private jsonLdScriptId = 'breadcrumb-jsonld';

  ngOnInit(): void {
    this.updateJsonLd();
  }

  ngOnDestroy(): void {
    this.removeJsonLd();
  }

  /**
   * Génère et insère le JSON-LD BreadcrumbList dans le <head>
   */
  private updateJsonLd(): void {
    this.removeJsonLd();

    const breadcrumbList = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: this.buildJsonLdItems(),
    };

    const script = document.createElement('script');
    script.id = this.jsonLdScriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(breadcrumbList);
    document.head.appendChild(script);
  }

  /**
   * Construit les éléments pour le JSON-LD
   */
  private buildJsonLdItems(): any[] {
    const baseUrl = 'https://dkronlinestore.sn';
    const allItems: BreadcrumbItem[] = [];

    if (this.showHome) {
      allItems.push({ label: 'Accueil', url: '/' });
    }

    allItems.push(...this.items);

    return allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.url ? `${baseUrl}${item.url}` : undefined,
    }));
  }

  /**
   * Supprime le script JSON-LD existant
   */
  private removeJsonLd(): void {
    const existingScript = document.getElementById(this.jsonLdScriptId);
    if (existingScript) {
      existingScript.remove();
    }
  }

  /**
   * Retourne les items à afficher (avec Home si nécessaire)
   */
  get displayItems(): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [];

    if (this.showHome) {
      items.push({ label: 'Accueil', url: '/' });
    }

    items.push(...this.items);

    return items;
  }
}
