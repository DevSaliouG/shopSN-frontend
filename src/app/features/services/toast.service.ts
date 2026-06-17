// src/app/core/services/toast.service.ts
import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSignal = signal<ToastMessage[]>([]);
  private nextId = 0;
  private defaultDuration = 4000;

  readonly toasts = this.toastsSignal.asReadonly();

  success(message: string, title?: string, duration = this.defaultDuration): void {
    this.add({ type: 'success', message, title, duration });
  }

  error(message: string, title?: string, duration = this.defaultDuration): void {
    this.add({ type: 'error', message, title, duration });
  }

  warning(message: string, title?: string, duration = this.defaultDuration): void {
    this.add({ type: 'warning', message, title, duration });
  }

  info(message: string, title?: string, duration = this.defaultDuration): void {
    this.add({ type: 'info', message, title, duration });
  }

  remove(id: number): void {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }

  clearAll(): void {
    this.toastsSignal.set([]);
  }

  private add(toast: Omit<ToastMessage, 'id'>): void {
    const id = this.nextId++;
    const duration = toast.duration ?? this.defaultDuration;
    this.toastsSignal.update(toasts => [...toasts, { ...toast, id }]);
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }
}