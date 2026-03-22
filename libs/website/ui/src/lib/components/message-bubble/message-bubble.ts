import {
  Component,
  computed,
  effect,
  inject,
  input,
  Signal,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { IDisplayMessage, MessageRole } from '@org/shared';
import { AnimationService } from '@org/core';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-bubble.html',
  styleUrl: './message-bubble.scss',
  host: {
    '[class.full-width]': 'message().role === MessageRole.ASSISTANT'
  }
})
export class MessageBubble {

  // ── Services ──────────────────────────────────────────────────────────────────────
  private readonly animationService = inject(AnimationService);
  private readonly sanitizer = inject(DomSanitizer);

  // ── Input/Output ──────────────────────────────────────────────────────────────────────
  message = input.required<IDisplayMessage>();

  // ── Signals ──────────────────────────────────────────────────────────────────────
  protected readonly MessageRole = MessageRole;
  protected renderedContent = signal<SafeHtml | null>(null);
  protected placeholderContent = signal<string | null>(null);
  protected isUser: Signal<boolean> = computed(() => this.message().role === MessageRole.USER);
  protected isAssistant: Signal<boolean> = computed(
    () => this.message().role === MessageRole.ASSISTANT,
  );

  // ── Lifecycle ──────────────────────────────────────────────────────────────────────
  constructor() {
    effect(() => {
      this.renderMarkdown(this.message().content);
    });
  }

  // ── Methods ──────────────────────────────────────────────────────────────────────
  private async renderMarkdown(text: string): Promise<void> {
    if (text === '') {
      this.animationService.typewrite({
        target: this.placeholderContent,
        text: '...',
        delay: 300,
      });
      return;
    }
    this.placeholderContent.set('');
    const rawHtml = await marked.parse(text, { breaks: true, gfm: true });
    const sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(rawHtml);
    this.renderedContent.set(sanitizedHtml);
  }
}
