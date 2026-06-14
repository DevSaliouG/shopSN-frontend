/**
 * Page de réinitialisation du mot de passe
 * Formulaire avec token d'activation reçu par email
 * 
 * Fonctionnalités:
 * - Vérification du token dans l'URL
 * - Validation mot de passe fort
 * - Confirmation du mot de passe
 * - Redirection après réinitialisation
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

// Validateur personnalisé : mot de passe fort (identique au register)
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

// Validateur personnalisé : confirmation du mot de passe
const passwordMatchValidator = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirm = control.get('password_confirmation')?.value;
  
  if (!password || !confirm) return null;
  return password === confirm ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // État local (Signals)
  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  token = signal<string | null>(null);
  email = signal<string | null>(null);

  // Formulaire
  resetForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, strongPasswordValidator]],
    password_confirmation: ['', [Validators.required]]
  }, {
    validators: passwordMatchValidator
  });

  get password() { return this.resetForm.get('password'); }
  get passwordConfirmation() { return this.resetForm.get('password_confirmation'); }

  ngOnInit(): void {
    // Récupération du token et email depuis les query params
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const email = params['email'];
      
      if (!token || !email) {
        this.errorMessage.set('Lien de réinitialisation invalide ou expiré.');
        return;
      }
      
      this.token.set(token);
      this.email.set(email);
    });
  }

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
   * Soumission du formulaire de réinitialisation
   */
  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const token = this.token();
    const email = this.email();
    
    if (!token || !email) {
      this.errorMessage.set('Lien de réinitialisation invalide.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService.resetPassword({
      token: token,
      email: email,
      password: this.password?.value,
      password_confirmation: this.passwordConfirmation?.value
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        // Redirection vers login avec message de succès
        this.router.navigate(['/connexion'], {
          queryParams: { resetSuccess: 'true' }
        });
      },
      error: (error) => {
        this.isSubmitting.set(false);
        if (error.error?.message) {
          this.errorMessage.set(error.error.message);
        } else if (error.status === 400) {
          this.errorMessage.set('Token invalide ou expiré. Veuillez refaire une demande.');
        } else {
          this.errorMessage.set('Une erreur est survenue. Veuillez réessayer.');
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
   * Bascule l'affichage de la confirmation
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(value => !value);
  }
}
