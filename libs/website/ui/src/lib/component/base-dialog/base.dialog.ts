import { Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'lib-base-dialog',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './base.dialog.html',
  styleUrls: ['./base.dialog.scss'],
})
export class BaseDialog {

  // ── Input/Output ──────────────────────────────────────────────────────────────────────
  title = input<string>('');
  closed = output<void>();
}
