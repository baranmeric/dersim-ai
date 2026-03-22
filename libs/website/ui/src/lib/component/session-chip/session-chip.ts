import { DatePipe, NgClass } from '@angular/common';
import { Component, effect, inject, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ISessionListItem } from '@dersim/shared';
import { AnimationService } from '@dersim/core';

@Component({
  selector: 'lib-session-chip',
  imports: [DatePipe, NgClass, MatIconModule],
  templateUrl: './session-chip.html',
  styleUrl: './session-chip.scss',
})
export class SessionChip {

  // ── Services ──────────────────────────────────────────────────────────────────────
  private readonly animationService = inject(AnimationService);

  // ── Input/Output ──────────────────────────────────────────────────────────────────────
  session = input.required<ISessionListItem>();
  selected = input.required<boolean>();
  onClick = output<string>();
  onDelete = output<string>();

  // ── Signals ──────────────────────────────────────────────────────────────────────
  protected readonly displayTitle = signal('');
  private previousSummary: string | undefined = undefined;

  // ── Lifecycle ──────────────────────────────────────────────────────────────────────
  constructor() {
    effect(() => {
      const summary = this.session().summary;
      if (!summary) {
        this.animationService.typewrite({
          target: this.displayTitle,
          text: '.....',
          delay: 300,
        });
        this.previousSummary = '';
        return;
      }
      if (summary === this.previousSummary) return;

      if (this.previousSummary === undefined) {
        this.displayTitle.set(summary);
      } else {
        this.animationService.typewrite({
          target: this.displayTitle,
          text: summary,
        });
      }
      this.previousSummary = summary;
    });
  }
}
