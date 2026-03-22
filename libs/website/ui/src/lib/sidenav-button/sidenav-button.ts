import { Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-sidenav-button',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './sidenav-button.html',
  styleUrl: './sidenav-button.scss',
})
export class SidenavButton {

  // ── Input/Output ──────────────────────────────────────────────────────────────────────
  title = input.required<string>();
  icon = input.required<string>();
  onClick = output<void>();
}
