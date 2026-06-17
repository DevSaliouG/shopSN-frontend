// src/app/shared/components/toast/toast.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../features/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50 space-y-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="rounded-lg shadow-lg p-4 min-w-[280px] max-w-sm animate-slide-in-right"
             [ngClass]="{
               'bg-green-50 border-l-4 border-green-500': toast.type === 'success',
               'bg-red-50 border-l-4 border-red-500': toast.type === 'error',
               'bg-yellow-50 border-l-4 border-yellow-500': toast.type === 'warning',
               'bg-blue-50 border-l-4 border-blue-500': toast.type === 'info'
             }">
          @if (toast.title) {
            <p class="font-semibold text-gray-800">{{ toast.title }}</p>
          }
          <p class="text-sm text-gray-600">{{ toast.message }}</p>
          <button (click)="toastService.remove(toast.id)"
                  class="absolute top-2 right-2 text-gray-400 hover:text-gray-600">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-slide-in-right {
      animation: slideInRight 0.3s ease-out;
    }
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}