import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div
          class="toast-item"
          [class.toast-success]="toast.type === 'success'"
          [class.toast-error]="toast.type === 'error'"
          [class.toast-warning]="toast.type === 'warning'"
          [class.toast-info]="toast.type === 'info'"
          role="alert"
        >
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              }
              @case ('error') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              }
              @case ('warning') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              }
              @case ('info') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              }
            }
          </div>
          <div class="toast-content">
            @if (toast.title) {
              <p class="toast-title">{{ toast.title }}</p>
            }
            <p class="toast-message">{{ toast.message }}</p>
          </div>
          <button class="toast-close" (click)="notificationService.dismiss(toast.id)" aria-label="Fermer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: var(--z-toast, 600);
      display: flex;
      flex-direction: column-reverse;
      gap: 8px;
      max-width: 380px;
      width: calc(100vw - 48px);
    }

    .toast-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 14px;
      background: white;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      border: 1px solid rgba(0, 0, 0, 0.04);
      animation: slideInToast 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      position: relative;
      overflow: hidden;
    }

    .toast-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
    }

    .toast-success::before { background: #22C55E; }
    .toast-error::before { background: #EF4444; }
    .toast-warning::before { background: #F59E0B; }
    .toast-info::before { background: #FF6600; }

    .toast-icon {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toast-success .toast-icon {
      background: rgba(34, 197, 94, 0.1);
      color: #16A34A;
    }

    .toast-error .toast-icon {
      background: rgba(239, 68, 68, 0.1);
      color: #DC2626;
    }

    .toast-warning .toast-icon {
      background: rgba(245, 158, 11, 0.1);
      color: #D97706;
    }

    .toast-info .toast-icon {
      background: rgba(255, 102, 0, 0.1);
      color: #FF6600;
    }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-weight: 600;
      font-size: 0.85rem;
      color: #1A1A1A;
      margin-bottom: 2px;
    }

    .toast-message {
      font-size: 0.8rem;
      color: #4A4A4A;
      line-height: 1.4;
    }

    .toast-close {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: #7A7A7A;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;

      &:hover {
        background: #F5F5F5;
        color: #1A1A1A;
      }
    }

    @keyframes slideInToast {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (max-width: 480px) {
      .toast-container {
        left: 16px;
        right: 16px;
        bottom: 16px;
        max-width: none;
        width: auto;
      }
    }
  `]
})
export class ToastComponent {
  protected readonly notificationService = inject(NotificationService);
}
