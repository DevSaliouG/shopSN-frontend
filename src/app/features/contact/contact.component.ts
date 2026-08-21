/**
 * Page Contact — DkrOnlineStore
 * Formulaire de contact et informations de l'entreprise
 *
 * Fonctionnalités:
 * - Hero section pleine largeur
 * - Layout 2 colonnes: infos + formulaire
 * - Cartes contact (WhatsApp, Email, Localisation)
 * - Horaires d'ouverture
 * - Formulaire avec validation complète
 * - États: loading, success, error
 * - Responsive design mobile-first
 * - WhatsApp mis en évidence
 */

import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../core/services/seo.service';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  // Form data
  formData: ContactFormData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  // Form states
  isSubmitting = signal<boolean>(false);
  formSuccess = signal<boolean>(false);
  formError = signal<string | null>(null);

  ngOnInit(): void {
    // SEO Meta tags
    this.seoService.setBasicMeta({
      title: 'Contactez-nous - DkrOnlineStore',
      description: 'Une question ? Besoin d\'aide ? Contactez l\'équipe DkrOnlineStore par WhatsApp, email ou formulaire. Nous sommes là pour vous répondre rapidement.',
      keywords: 'contact dkronlinestore, contacter boutique en ligne, whatsapp dkronlinestore, support client dakar, service client sénégal',
      type: 'website'
    });

    this.seoService.setOpenGraphMeta({
      title: 'Contactez-nous - DkrOnlineStore',
      description: 'Notre équipe est là pour répondre à toutes vos questions.',
      type: 'website'
    });

    this.seoService.setTwitterCard({
      title: 'Contactez-nous - DkrOnlineStore',
      description: 'Notre équipe est là pour répondre à toutes vos questions.'
    });

    // Structured data for LocalBusiness (Google Maps/SEO Local)
    this.seoService.setLocalBusinessStructuredData();
  }

  /**
   * Soumet le formulaire de contact
   */
  onSubmit(): void {
    // Vérifier que le formulaire n'est pas déjà en cours de soumission
    if (this.isSubmitting()) {
      return;
    }

    // Reset states
    this.formError.set(null);
    this.formSuccess.set(false);

    // Validation basique côté client
    if (!this.validateForm()) {
      return;
    }

    // Démarre la soumission
    this.isSubmitting.set(true);

    // Simuler l'envoi (à remplacer par un vrai appel HTTP au backend)
    setTimeout(() => {
      try {
        // TODO: Implémenter l'appel HTTP vers le backend
        // Exemple:
        // this.http.post('/api/contact', this.formData).subscribe({
        //   next: () => {
        //     this.formSuccess.set(true);
        //     this.resetForm();
        //   },
        //   error: (err) => {
        //     this.formError.set('Une erreur est survenue. Veuillez réessayer.');
        //   },
        //   complete: () => {
        //     this.isSubmitting.set(false);
        //   }
        // });

        // Simulation succès
        console.log('Formulaire soumis:', this.formData);
        this.formSuccess.set(true);
        this.resetForm();

        // Auto-masquer le message de succès après 5 secondes
        setTimeout(() => {
          this.formSuccess.set(false);
        }, 5000);
      } catch (error) {
        console.error('Erreur lors de la soumission:', error);
        this.formError.set('Une erreur inattendue est survenue. Veuillez réessayer plus tard.');
      } finally {
        this.isSubmitting.set(false);
      }
    }, 1500); // Simuler délai réseau
  }

  /**
   * Valide le formulaire côté client
   */
  private validateForm(): boolean {
    // Nom
    if (!this.formData.name || this.formData.name.trim().length < 2) {
      this.formError.set('Veuillez saisir votre nom (minimum 2 caractères).');
      return false;
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.formData.email || !emailRegex.test(this.formData.email)) {
      this.formError.set('Veuillez saisir une adresse email valide.');
      return false;
    }

    // Sujet
    if (!this.formData.subject || this.formData.subject.trim().length < 5) {
      this.formError.set('Veuillez saisir un sujet (minimum 5 caractères).');
      return false;
    }

    // Message
    if (!this.formData.message || this.formData.message.trim().length < 20) {
      this.formError.set('Veuillez saisir un message (minimum 20 caractères).');
      return false;
    }

    return true;
  }

  /**
   * Réinitialise le formulaire après soumission réussie
   */
  private resetForm(): void {
    this.formData = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
  }
}
