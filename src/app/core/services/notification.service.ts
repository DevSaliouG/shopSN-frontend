import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  persistent: boolean;
  action?: { label: string; url?: string };
}

export interface ToastNotification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration: number;
}

const STORAGE_KEY = 'shopsn_notifications';
const MAX_NOTIFICATIONS = 50;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly platformId = inject(PLATFORM_ID);

  private toastsSignal = signal<ToastNotification[]>([]);
  private notificationsSignal = signal<Notification[]>([]);
  private centerOpenSignal = signal(false);

  readonly toasts = this.toastsSignal.asReadonly();
  readonly notifications = this.notificationsSignal.asReadonly();
  readonly centerOpen = this.centerOpenSignal.asReadonly();

  readonly unreadCount = computed(() =>
    this.notificationsSignal().filter(n => !n.read).length
  );

  readonly hasUnread = computed(() => this.unreadCount() > 0);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFromStorage();
    }
  }

  show(message: string, type: NotificationType = 'info', title?: string, duration = 4000): void {
    const toast: ToastNotification = {
      id: this.generateId(),
      type,
      title,
      message,
      duration,
    };
    this.toastsSignal.update(t => [...t, toast]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(toast.id), duration);
    }
  }

  success(message: string, title?: string, duration = 4000): void {
    this.show(message, 'success', title, duration);
  }

  warning(message: string, title?: string, duration = 5000): void {
    this.show(message, 'warning', title, duration);
  }

  error(message: string, title?: string, duration = 6000): void {
    this.show(message, 'error', title, duration);
  }

  info(message: string, title?: string, duration = 4000): void {
    this.show(message, 'info', title, duration);
  }

  dismiss(id: string): void {
    this.toastsSignal.update(t => t.filter(toast => toast.id !== id));
  }

  dismissAll(): void {
    this.toastsSignal.set([]);
  }

  addNotification(
    type: NotificationType,
    title: string,
    message: string,
    options?: { persistent?: boolean; action?: { label: string; url?: string } }
  ): void {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      persistent: options?.persistent ?? true,
      action: options?.action,
    };

    this.notificationsSignal.update(notifications => {
      const updated = [notification, ...notifications].slice(0, MAX_NOTIFICATIONS);
      this.saveToStorage(updated);
      return updated;
    });
  }

  markAsRead(id: string): void {
    this.notificationsSignal.update(notifications => {
      const updated = notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      this.saveToStorage(updated);
      return updated;
    });
  }

  markAllAsRead(): void {
    this.notificationsSignal.update(notifications => {
      const updated = notifications.map(n => ({ ...n, read: true }));
      this.saveToStorage(updated);
      return updated;
    });
  }

  removeNotification(id: string): void {
    this.notificationsSignal.update(notifications => {
      const updated = notifications.filter(n => n.id !== id);
      this.saveToStorage(updated);
      return updated;
    });
  }

  clearNotifications(): void {
    this.notificationsSignal.set([]);
    this.clearStorage();
  }

  toggleCenter(): void {
    this.centerOpenSignal.update(v => !v);
  }

  openCenter(): void {
    this.centerOpenSignal.set(true);
  }

  closeCenter(): void {
    this.centerOpenSignal.set(false);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Notification[];
        this.notificationsSignal.set(
          parsed.map(n => ({ ...n, timestamp: new Date(n.timestamp) }))
        );
      }
    } catch {
      // Ignore storage errors
    }
  }

  private saveToStorage(notifications: Notification[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // Ignore storage errors
    }
  }

  private clearStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }
}
