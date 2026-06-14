/**
 * Page Mot de passe oublié
 * Permet à l'utilisateur de demander un email de réinitialisation
 * 
 * Fonctionnalités:
 * - Envoi d'email avec lien de réinitialisation
 * - Validation d'email
 * - Feedback utilisateur (succès/erreur)
 * - Rate limiting protection
 */

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  // État local (Signals)
  isSubmitted = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // Formulaire
  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  get email() { return this.forgotForm.get('email'); }

  /**
   * Soumission du formulaire de réinitialisation
   */
  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isSubmitted.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.authService.forgotPassword(this.email?.value).subscribe({
      next: (response) => {
        this.successMessage.set(response.message || 'Un email de réinitialisation vous a été envoyé.');
        this.isSubmitted.set(false);
        // Reset du formulaire
        this.forgotForm.reset();
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Une erreur est survenue. Veuillez réessayer.');
        this.isSubmitted.set(false);
      }
    });
  }

  /**
   * Reset du formulaire pour réessayer
   */
  resetForm(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.forgotForm.reset();
    this.forgotForm.markAsPristine();
  }
}
