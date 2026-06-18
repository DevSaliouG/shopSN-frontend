import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (notificationService.centerOpen()) {
      <div class="nc-overlay" (click)="notificationService.closeCenter()"></div>
      <div class="nc-panel">
        <div class="nc-header">
          <h3>Notifications</h3>
          <div class="nc-header-actions">
            @if (notificationService.hasUnread()) {
              <button class="nc-action-btn" (click)="notificationService.markAllAsRead()">
                Tout marquer lu
              </button>
            }
            <button class="nc-close" (click)="notificationService.closeCenter()" aria-label="Fermer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="nc-body">
          @if (notificationService.notifications().length === 0) {
            <div class="nc-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <p>Aucune notification</p>
            </div>
          } @else {
            @for (notification of notificationService.notifications(); track notification.id) {
              <div
                class="nc-item"
                [class.nc-item-unread]="!notification.read"
                (click)="notificationService.markAsRead(notification.id)"
              >
                <div class="nc-item-icon" [ngClass]="'nc-icon-' + notification.type">
                  @switch (notification.type) {
                    @case ('success') {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    }
                    @case ('error') {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    }
                    @case ('warning') {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                    }
                    @case ('info') {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    }
                  }
                </div>
                <div class="nc-item-content">
                  <p class="nc-item-title">{{ notification.title }}</p>
                  <p class="nc-item-message">{{ notification.message }}</p>
                  <span class="nc-item-time">{{ formatTime(notification.timestamp) }}</span>
                </div>
                <button
                  class="nc-item-remove"
                  (click)="$event.stopPropagation(); notificationService.removeNotification(notification.id)"
                  aria-label="Supprimer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            }
          }
        </div>

        @if (notificationService.notifications().length > 0) {
          <div class="nc-footer">
            <button class="nc-clear-btn" (click)="notificationService.clearNotifications()">
              Effacer tout
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .nc-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(2px);
      z-index: 9990;
      animation: fadeIn 0.2s ease;
    }

    .nc-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 380px;
      max-width: 100vw;
      background: white;
      z-index: 9991;
      display: flex;
      flex-direction: column;
      box-shadow: -8px 0 32px rgba(0, 0, 0, 0.1);
      animation: slideInPanel 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    .nc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 20px 16px;
      border-bottom: 1px solid #E8EDF2;

      h3 {
        font-size: 1.1rem;
        font-weight: 700;
        color: #1A1A1A;
      }
    }

    .nc-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nc-action-btn {
      font-size: 0.75rem;
      font-weight: 600;
      color: #2D5A4C;
      background: rgba(45, 90, 76, 0.08);
      border: none;
      padding: 6px 12px;
      border-radius: 999px;
      cursor: pointer;
      transition: background 0.15s;

      &:hover { background: rgba(45, 90, 76, 0.15); }
    }

    .nc-close {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: #7A7A7A;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;

      &:hover { background: #E8EDF2; color: #1A1A1A; }
    }

    .nc-body {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }

    .nc-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      color: #7A7A7A;
      gap: 12px;

      p { font-size: 0.9rem; }
    }

    .nc-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 12px;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.15s;
      position: relative;

      &:hover { background: #F0F4F8; }
    }

    .nc-item-unread {
      background: rgba(45, 90, 76, 0.03);

      &::after {
        content: '';
        position: absolute;
        top: 18px;
        left: 4px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #2D5A4C;
      }
    }

    .nc-item-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .nc-icon-success { background: rgba(34, 197, 94, 0.1); color: #16A34A; }
    .nc-icon-error { background: rgba(239, 68, 68, 0.1); color: #DC2626; }
    .nc-icon-warning { background: rgba(245, 158, 11, 0.1); color: #D97706; }
    .nc-icon-info { background: rgba(45, 90, 76, 0.1); color: #2D5A4C; }

    .nc-item-content {
      flex: 1;
      min-width: 0;
    }

    .nc-item-title {
      font-weight: 600;
      font-size: 0.825rem;
      color: #1A1A1A;
      margin-bottom: 2px;
    }

    .nc-item-message {
      font-size: 0.775rem;
      color: #7A7A7A;
      line-height: 1.4;
    }

    .nc-item-time {
      font-size: 0.7rem;
      color: #A0A0A0;
      margin-top: 4px;
      display: block;
    }

    .nc-item-remove {
      opacity: 0;
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
    }

    .nc-item:hover .nc-item-remove {
      opacity: 1;
    }

    .nc-item-remove:hover {
      background: rgba(239, 68, 68, 0.08);
      color: #DC2626;
    }

    .nc-footer {
      padding: 12px 16px;
      border-top: 1px solid #E8EDF2;
      text-align: center;
    }

    .nc-clear-btn {
      font-size: 0.8rem;
      font-weight: 500;
      color: #7A7A7A;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 999px;
      transition: all 0.15s;

      &:hover { color: #DC2626; background: rgba(239, 68, 68, 0.06); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideInPanel {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    @media (max-width: 480px) {
      .nc-panel { width: 100vw; }
    }
  `]
})
export class NotificationCenterComponent {
  protected readonly notificationService = inject(NotificationService);

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "A l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}
