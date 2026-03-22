import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatFabButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export enum ButtonSlideDirection {
  None = '',
  Up = 'up',
  Right = 'right',
  Left = 'left',
}

@Component({
  selector: 'app-button',
  imports: [MatFabButton, MatIconModule, MatProgressSpinnerModule, CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {

  // ── Input/Output ──────────────────────────────────────────────────────────────────────
  title = input<string>();
  iconName = input<string>();
  flexDirection = input<string>('row-reverse');
  slideDirection = input<string>(ButtonSlideDirection.Up);
  loading = input(false);
  onClick = output();

  // ── Signals ──────────────────────────────────────────────────────────────────────
  protected readonly ButtonSlideDirection = ButtonSlideDirection;
}
