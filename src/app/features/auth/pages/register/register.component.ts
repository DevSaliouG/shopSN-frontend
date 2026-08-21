/**
 * Page d'inscription utilisateur
 * Formulaire réactif typé avec validation complète (frontend + backend)
 * 
 * Fonctionnalités:
 * - Validation temps réel (mot de passe fort, confirmation)
 * - Gestion des erreurs serveur (email déjà utilisé, etc.)
 * - Redirection automatique après inscription
 * - Loading state avec signals
 * - Validation personnalisée (mot de passe fort)
 */

import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
// Validateur personnalisé : confirmation du mot de passe
const passwordMatchValidator = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirm = control.get('password_confirmation')?.value;
  
  if (!password || !confirm) return null;
  return password === confirm ? null : { passwordMismatch: true };
};

// Validateur personnalisé : mot de passe fort
const strongPasswordValidator = (control: AbstractControl): ValidationErrors | null => {
  const password = control.value;
  
  if (!password) return null;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[@$!%*#?&]/.test(password);
  const isValidLength = password.length >= 8;
  
  const errors: ValidationErrors = {};
  
  if (!isValidLength) errors['minlength'] = true;
  if (!hasUpperCase) errors['noUpperCase'] = true;
  if (!hasLowerCase) errors['noLowerCase'] = true;
  if (!hasNumber) errors['noNumber'] = true;
  if (!hasSpecialChar) errors['noSpecialChar'] = true;
  
  return Object.keys(errors).length ? errors : null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFadeIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(60, [
            animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('errorShake', [
      transition(':enter', [
        style({ transform: 'translateX(0)' }),
        animate('400ms', style({ transform: 'translateX(-10px)' })),
        animate('100ms', style({ transform: 'translateX(10px)' })),
        animate('100ms', style({ transform: 'translateX(-10px)' })),
        animate('100ms', style({ transform: 'translateX(10px)' })),
        animate('100ms', style({ transform: 'translateX(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // État local du composant (Signals)
  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);
  serverErrors = signal<Record<string, string[]>>({});
  acceptedTerms = signal<boolean>(false);

  // Formulaire réactif typé avec validations
  registerForm: FormGroup = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: ['', [Validators.required, strongPasswordValidator]],
    password_confirmation: ['', [Validators.required]],
    acceptTerms: [false, [Validators.requiredTrue]]
  }, {
    validators: passwordMatchValidator
  });

  // Getters pour accès facile dans le template
  get nom() { return this.registerForm.get('nom'); }
  get prenom() { return this.registerForm.get('prenom'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get passwordConfirmation() { return this.registerForm.get('password_confirmation'); }
  get acceptTermsCtrl() { return this.registerForm.get('acceptTerms'); }

  /**
   * Récupère les messages d'erreur pour le mot de passe
   */
  getPasswordErrors(): string[] {
    const errors = this.password?.errors;
    if (!errors || !this.password?.touched) return [];
    
    const messages: string[] = [];
    if (errors['required']) messages.push('Le mot de passe est obligatoire');
    if (errors['minlength']) messages.push('Minimum 8 caractères');
    if (errors['noUpperCase']) messages.push('Au moins une majuscule');
    if (errors['noLowerCase']) messages.push('Au moins une minuscule');
    if (errors['noNumber']) messages.push('Au moins un chiffre');
    if (errors['noSpecialChar']) messages.push('Au moins un caractère spécial (@$!%*#?&)');
    
    return messages;
  }

  /**
   * Vérifie si le champ a des erreurs spécifiques du serveur
   */
  hasServerError(field: string): boolean {
    return !!this.serverErrors()[field];
  }

  /**
   * Récupère le message d'erreur serveur pour un champ
   */
  getServerError(field: string): string | null {
    const errors = this.serverErrors()[field];
    return errors && errors.length > 0 ? errors[0] : null;
  }

  /**
   * Soumission du formulaire d'inscription
   */
  onSubmit(): void {
    // Validation du formulaire
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    // Reset des erreurs serveur
    this.serverErrors.set({});

    // Préparation des données
    const formData = {
      nom: this.nom?.value,
      prenom: this.prenom?.value,
      email: this.email?.value,
      password: this.password?.value,
      password_confirmation: this.passwordConfirmation?.value
    };

    // Appel au service d'authentification
    this.authService.register(formData).subscribe({
      next: () => {
        // Redirection après inscription réussie
        this.router.navigate(['/profil']);
      },
      error: (error) => {
        // Gestion des erreurs 422 (validation Laravel)
        if (error.status === 422 && error.error?.errors) {
          this.serverErrors.set(error.error.errors);
        } else if (error.error?.message) {
          // Erreur générale
          this.serverErrors.set({
            general: [error.error.message]
          });
        } else {
          this.serverErrors.set({
            general: ['Une erreur est survenue lors de l\'inscription.']
          });
        }
      }
    });
  }

  /**
   * Bascule l'affichage du mot de passe
   */
  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  /**
   * Bascule l'affichage de la confirmation du mot de passe
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(value => !value);
  }

  /**
   * Met à jour l'état des conditions acceptées
   */
  updateAcceptedTerms(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.acceptedTerms.set(input.checked);
  }
}
