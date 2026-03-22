import {
  Component,
  output,
  signal,
  computed,
  input,
  ElementRef,
  viewChild,
  AfterViewInit,
  effect,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIcon, ReactiveFormsModule],
  templateUrl: './chat-input.html',
  styleUrls: ['./chat-input.scss'],
})
export class ChatInputComponent implements AfterViewInit {

  // ── Input/Output ─────────────────────────────────────────────────────────────────
  placeholder = input<string>('Message...');
  disabled = input<boolean>(false);
  messageSent = output<string>();
  inputChanged = output<string>();

  // ── Signals ──────────────────────────────────────────────────────────────────────
  protected userInput = new FormControl('');
  protected isFocused = signal(false);
  protected charCount = signal(0);
  protected canSend: Signal<boolean> = computed(() => this.charCount() > 0 && !this.disabled());

  // ── View References ──────────────────────────────────────────────────────────────
  private textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textareaRef');

  // ── Lifecycle ────────────────────────────────────────────────────────────────────
  constructor() {
    effect(() => {
      if (this.disabled()) {
        this.isFocused.set(false);
        this.userInput.disable();
      } else {
        this.userInput.enable();
      }
    });
    this.userInput.valueChanges.subscribe(value => this.onInputChange(value));
  }

  ngAfterViewInit() {
    this.autoResize();
  }

  // ── Methods ──────────────────────────────────────────────────────────────────────
  protected onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.canSend()) {
        this.sendMessage();
      }
    }
  }

  protected sendMessage() {
    const content = this.userInput.value?.trim();
    if (!content) return;

    this.messageSent.emit(content);
    this.userInput.reset();
    this.charCount.set(0);
    this.autoResize();
  }

  private onInputChange(value: string | null) {
    this.charCount.set(value?.trim().length ?? 0);
    this.autoResize();
    this.inputChanged.emit(value ?? '');
  }

  private autoResize() {
    const textarea = this.textareaRef()?.nativeElement;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
  }
}
