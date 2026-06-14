/**
 * Page de profil utilisateur
 * Permet de consulter et modifier les informations personnelles
 * 
 * Fonctionnalités:
 * - Affichage des informations du profil
 * - Modification du profil (formulaire réactif)
 * - Upload d'avatar avec prévisualisation
 * - Changement de mot de passe
 * - Statistiques utilisateur
 * - Suppression de compte
 */

import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { User, UserStats } from '../../../models/user.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  // État
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  isChangingPassword = signal<boolean>(false);
  showPasswordForm = signal<boolean>(false);
  showDeleteConfirm = signal<boolean>(false);
  userStats = signal<UserStats | null>(null);
  previewAvatar = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // Formulaire de profil
  profileForm: FormGroup = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^[0-9+\-\s]{8,20}$/)]],
    adresse: ['', [Validators.maxLength(255)]],
    ville: ['', [Validators.maxLength(100)]],
    code_postal: ['', [Validators.pattern(/^[0-9]{5}$/)]],
    pays: ['', [Validators.maxLength(100)]]
  });

  // Formulaire de changement de mot de passe
  passwordForm: FormGroup = this.fb.group({
    current_password: ['', [Validators.required]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/[A-Z]/),
      Validators.pattern(/[0-9]/),
      Validators.pattern(/[@$!%*#?&]/)
    ]],
    password_confirmation: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  // Computed signals
  readonly user = computed(() => this.authService.currentUser());
  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  readonly userFullName = computed(() => {
    const user = this.user();
    return user ? `${user.prenom} ${user.nom}` : '';
  });
  readonly userInitials = computed(() => {
    const user = this.user();
    if (!user) return '';
    return `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
  });
  readonly avatarUrl = computed(() => {
    const preview = this.previewAvatar();
    if (preview) return preview;
    const user = this.user();
    return user?.avatar_url || '/assets/images/default-avatar.png';
  });

  ngOnInit(): void {
    this.loadProfile();
    this.loadUserStats();
  }

  /**
   * Charge le profil utilisateur
   */
  private loadProfile(): void {
    this.isLoading.set(true);
    
    this.userService.getProfile().subscribe({
      next: (response) => {
        const user = response.data;
        this.profileForm.patchValue({
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          phone: user.phone || '',
          adresse: user.adresse || '',
          ville: user.ville || '',
          code_postal: user.code_postal || '',
          pays: user.pays || 'Sénégal'
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Erreur lors du chargement du profil');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Charge les statistiques utilisateur
   */
  private loadUserStats(): void {
    this.userService.getUserStats().subscribe({
      next: (response) => {
        this.userStats.set(response.data);
      },
      error: () => {
        // Silencieux - pas critique
      }
    });
  }

  /**
   * Validateur de confirmation du mot de passe
   */
  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirm = group.get('password_confirmation')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  /**
   * Gère la sélection d'un fichier avatar
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validation du type
      if (!file.type.startsWith('image/')) {
        this.errorMessage.set('Veuillez sélectionner une image');
        return;
      }
      
      // Validation de la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage.set('L\'image ne doit pas dépasser 2MB');
        return;
      }
      
      this.selectedFile.set(file);
      
      // Prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewAvatar.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload automatique
      this.uploadAvatar();
    }
  }

  /**
   * Upload de l'avatar
   */
  uploadAvatar(): void {
  const file = this.selectedFile();
  if (!file) return;
  
  this.isSaving.set(true);
  this.errorMessage.set(null);
  this.successMessage.set(null);
  
  this.userService.uploadAvatar(file).subscribe({
    next: (response) => {
      // Utilisation correcte de la réponse
      const avatarUrl = response.avatar_url;
      
      this.successMessage.set('Avatar mis à jour avec succès');
      this.isSaving.set(false);
      this.previewAvatar.set(null);
      this.selectedFile.set(null);
      
      // Met à jour l'utilisateur dans AuthService avec la bonne structure
      this.authService.updateUserData({ avatar_url: avatarUrl });
      
      // Met également à jour l'utilisateur localement si nécessaire
      const currentUser = this.authService.currentUser();
      if (currentUser) {
        // Force le rafraîchissement du signal
        this.authService.refreshUserData();
      }
      
      setTimeout(() => this.successMessage.set(null), 3000);
    },
    error: (error) => {
      console.error('Upload error:', error);
      this.errorMessage.set(error.error?.message || error.message || 'Erreur lors de l\'upload');
      this.isSaving.set(false);
      this.previewAvatar.set(null);
      this.selectedFile.set(null);
    }
  });
}
  /**
   * Supprime l'avatar
   */
  deleteAvatar(): void {
    if (!confirm('Voulez-vous vraiment supprimer votre avatar ?')) return;
    
    this.isSaving.set(true);
    
    this.userService.deleteAvatar().subscribe({
      next: () => {
        this.successMessage.set('Avatar supprimé avec succès');
        this.isSaving.set(false);
        this.authService.updateUserData({ avatar_url: '/assets/images/default-avatar.png' });
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la suppression');
        this.isSaving.set(false);
      }
    });
  }

  /**
   * Sauvegarde le profil
   */
  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    
    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: (response) => {
        this.successMessage.set('Profil mis à jour avec succès');
        this.isSaving.set(false);
        
        // Met à jour l'utilisateur dans AuthService
        this.authService.updateUserData(response.data);
        
        // Cache le message après 3 secondes
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (error) => {
        if (error.status === 422 && error.error?.errors) {
          const errors = error.error.errors;
          Object.keys(errors).forEach(key => {
            this.profileForm.get(key)?.setErrors({ server: errors[key][0] });
          });
          this.errorMessage.set('Veuillez corriger les erreurs dans le formulaire');
        } else {
          this.errorMessage.set(error.error?.message || 'Erreur lors de la mise à jour');
        }
        this.isSaving.set(false);
      }
    });
  }

  /**
   * Change le mot de passe
   */
  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    
    this.isChangingPassword.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    
    this.userService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.successMessage.set('Mot de passe changé avec succès');
        this.isChangingPassword.set(false);
        this.showPasswordForm.set(false);
        this.passwordForm.reset();
        
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (error) => {
        if (error.status === 422 && error.error?.errors) {
          const errors = error.error.errors;
          Object.keys(errors).forEach(key => {
            this.passwordForm.get(key)?.setErrors({ server: errors[key][0] });
          });
          this.errorMessage.set('Veuillez corriger les erreurs');
        } else {
          this.errorMessage.set(error.error?.message || 'Erreur lors du changement de mot de passe');
        }
        this.isChangingPassword.set(false);
      }
    });
  }

  /**
   * Supprime le compte utilisateur
   */
  deleteAccount(): void {
    if (!confirm('⚠️ Attention : Cette action est irréversible. Toutes vos données seront supprimées. Confirmez-vous ?')) {
      this.showDeleteConfirm.set(false);
      return;
    }
    
    this.isSaving.set(true);
    
    this.userService.deleteAccount().subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la suppression du compte');
        this.isSaving.set(false);
        this.showDeleteConfirm.set(false);
      }
    });
  }

  /**
   * Formate la date d'inscription
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Gère les erreurs de formulaire
   */
  getFieldError(fieldName: string): string | null {
    const control = this.profileForm.get(fieldName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Ce champ est obligatoire';
      if (control.errors['email']) return 'Email invalide';
      if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} caractères`;
      if (control.errors['maxlength']) return `Maximum ${control.errors['maxlength'].requiredLength} caractères`;
      if (control.errors['pattern']) return 'Format invalide';
      if (control.errors['server']) return control.errors['server'];
    }
    return null;
  }
}