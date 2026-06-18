/**
 * Page de connexion
 * Formulaire réactif typé avec validation complète
 *
 * Fonctionnalités:
 * - Validation en temps réel
 * - Gestion des erreurs serveur
 * - Redirection après connexion
 * - Loading state avec signals
 */

import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // État local du composant (Signals)
  showPassword = signal<boolean>(false);
  serverError = signal<string | null>(null);

  // Formulaire réactif typé
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  // Getters pour accès facile dans le template
  get email() {
    return this.loginForm.get('email');
  }
  get password() {
    return this.loginForm.get('password');
  }

  /**
   * Soumission du formulaire de connexion
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.serverError.set(null);

    this.authService
      .login({
        email: this.email?.value,
        password: this.password?.value,
      })
      .subscribe({
        next: () => {
          // 1. On récupère le returnUrl SANS lui assigner de valeur par défaut immédiate
          const returnUrl = this.route.snapshot.queryParams['returnUrl'];

          if (returnUrl) {
            // Si l'utilisateur tentait d'accéder à une page précise avant d'être redirigé
            this.router.navigateByUrl(returnUrl);
          } else if (this.authService.isAdmin()) {
            // Si c'est un admin et qu'aucune page spécifique n'était demandée : direction l'admin
            this.router.navigate(['/admin']);
          } else {
            // Sinon, direction la page d'accueil pour les utilisateurs standards
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          if (error.status === 401) {
            this.serverError.set('Email ou mot de passe incorrect.');
          } else if (error.error?.message) {
            this.serverError.set(error.error.message);
          } else {
            this.serverError.set('Erreur de connexion. Veuillez réessayer.');
          }
        },
      });
  }

  /**
   * Bascule l'affichage du mot de passe
   */
  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }
}
