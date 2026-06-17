// src/app/shared/components/loading-spinner/loading-spinner.component.ts
import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinnerSize = 'sm' | 'small' | 'medium' | 'large';
export type SpinnerColor = 'primary' | 'white' | 'gray' | 'success';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  size = input<SpinnerSize>('medium');
  color = input<SpinnerColor>('primary');
  text = input<string>('');
  overlay = input<boolean>(false);
  fullScreen = input<boolean>(false);

  readonly spinnerSize = computed(() => {
    switch (this.size()) {
      case 'sm':
      case 'small':
        return 'w-5 h-5';
      case 'large':
        return 'w-12 h-12';
      default:
        return 'w-8 h-8';
    }
  });

  readonly spinnerBorder = computed(() => {
    switch (this.size()) {
      case 'sm':
      case 'small':
        return 'border-2';
      case 'large':
        return 'border-4';
      default:
        return 'border-3';
    }
  });

  readonly spinnerColor = computed(() => {
    switch (this.color()) {
      case 'white':
        return 'border-white border-t-white/30';
      case 'gray':
        return 'border-gray-600 border-t-gray-300';
      case 'success':
        return 'border-green-600 border-t-green-300';
      default:
        return 'border-primary-600 border-t-primary-300';
    }
  });

  readonly textSize = computed(() => {
    switch (this.size()) {
      case 'sm':
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-base';
      default:
        return 'text-sm';
    }
  });

  readonly overlayClass = computed(() => {
    if (!this.overlay()) return '';
    return this.fullScreen()
      ? 'fixed inset-0 bg-black/50 z-50'
      : 'absolute inset-0 bg-white/80 z-10';
  });

  readonly containerClass = computed(() => {
    const classes = ['flex', 'flex-col', 'items-center', 'justify-center'];
    if (this.overlay()) {
      classes.push(this.fullScreen() ? 'min-h-screen' : 'min-h-[200px]');
    }
    return classes.join(' ');
  });
}
