import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from '@org/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

  // ── Services ──────────────────────────────────────────────────────────────────────
  private readonly userService = inject(UserService);

  // ── Signals ──────────────────────────────────────────────────────────────────────
  protected readonly loadingUser = signal(true);

  // ── Lifecycle ──────────────────────────────────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    this.loadingUser.set(true);
    await this.userService.refreshUser();
    this.loadingUser.set(false);
  }
}
