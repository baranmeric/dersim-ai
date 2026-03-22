import {
  Component, OnInit, ElementRef,
  signal, computed, viewChild,
  inject,
  Signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { finalize } from 'rxjs';
import { ISessionDto, ISessionListItem, IDisplayMessage, MessageRole, utils } from '@dersim/shared';
import { UserAction } from '@dersim/store';
import { SocketService, LayoutService, SnackbarService } from '@dersim/core';
import {
  MessageBubble, SidenavButton, SessionChip, ChatInputComponent, DialogService, SignOutDialog,
} from '@dersim/ui';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { ChatHttpService } from '../../service/chat-http.service';
import { SessionHttpService } from '../../service/session-http.service';

@Component({
  selector: 'lib-chat',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatIconModule, MessageBubble, MatSidenavModule,
    MatButtonModule, SessionChip, ChatInputComponent, SidenavButton,
  ],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss'],
})
export class Chat implements OnInit {

  // ── Services ──────────────────────────────────────────────────────────────────────
  private readonly layoutService = inject(LayoutService);
  private readonly dialogService = inject(DialogService);
  private readonly chatService = inject(ChatHttpService);
  private readonly sessionService = inject(SessionHttpService);
  private readonly socketService = inject(SocketService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly store = inject(Store);

  // ── Signals ──────────────────────────────────────────────────────────────────────
  protected isLoading = signal(false);
  protected messages = signal<IDisplayMessage[]>([]);
  protected streamedAssistantMessage = signal<IDisplayMessage | null>(null);
  protected currentSession = signal<ISessionDto | null>(null);
  protected userScrolled = signal<boolean>(false);
  protected isMobile = this.layoutService.isMobile;
  private readonly sessions = signal<ISessionListItem[]>([]);
  private readonly socketSessionUpdate: Signal<ISessionListItem | null> =
    this.socketService.latestSessionUpdate;
  protected readonly displaySessions: Signal<ISessionListItem[]> = computed(() => {
    const update = this.socketSessionUpdate();
    if (!update) return this.sessions();
    return this.sessions().map(s => s.id === update.id ? update : s);
  });

  // ── View References ──────────────────────────────────────────────────────────────────────
  private readonly scrollContainerRef = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');
  private readonly drawer = viewChild.required<MatDrawer>('drawer');

  // ── Lifecycle ──────────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadSessions();
  }

  // ── Methods ──────────────────────────────────────────────────────────────────────

  // Chat
  protected async onSend(content: string): Promise<void> {
    const userMessage: IDisplayMessage = {
      role: MessageRole.USER,
      content,
      createdAt: new Date(),
    };

    this.messages.update(m => [...m, userMessage]);
    this.scrollToBottom();
    const sessionId = this.currentSession()?._id;
    if (sessionId) {
      this.sendChatMessage(sessionId, content);
    } else {
      this.createNewSession(content);
    }
  }

  private async sendChatMessage(sessionId: string, content: string): Promise<void> {
    try {
      const $stream = await this.chatService.streamChat(sessionId, content);
      this.streamedAssistantMessage.set(this.createAssistantMessage(''));

      $stream.pipe(
        finalize(() => {
          this.messages.update(m => [...m, this.streamedAssistantMessage()!]);
          this.streamedAssistantMessage.set(null);
        }),
      ).subscribe(response => {
        this.streamedAssistantMessage.set({
          role: MessageRole.ASSISTANT,
          content: response,
          createdAt: new Date(),
        });
      });
    } catch (err) {
      console.error('Chat failed:', err);
      const errorMessage = this.createAssistantMessage(
        'I am sorry. It seems like something went wrong. Please try again later.',
      );
      this.messages.update(m => [...m, errorMessage]);
    }
  }

  private createAssistantMessage(content: string): IDisplayMessage {
    return { role: MessageRole.ASSISTANT, content, createdAt: new Date() };
  }

  // Sessions
  protected async onSessionDelete(sessionId: string): Promise<void> {
    await this.sessionService.deleteSession(sessionId);
    this.sessions.update(sessions => sessions.filter(s => s.id !== sessionId));
    if (sessionId === this.currentSession()?._id) {
      this.clearCurrentSession();
    }
  }

  protected async onSessionClick(sessionId: string): Promise<void> {
    if (sessionId === this.currentSession()?._id) return;
    this.isLoading.set(true);
    try {
      const session = await this.sessionService.getSession(sessionId);
      this.currentSession.set(session);
      this.messages.set(session.displayMessages);
      this.scrollToBottom();
      if (this.isMobile()) {
        this.drawer().close();
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadSessions(): Promise<void> {
    this.isLoading.set(true);
    try {
      const s = await this.sessionService.getSessions();
      this.sessions.set(s || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async createNewSession(content?: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const session = await this.sessionService.createSession();
      this.currentSession.set(session);
      const s = await this.sessionService.getSessions();
      this.sessions.set(s || []);
      if (content?.trim()) {
        this.sendChatMessage(session._id, content);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  private async clearCurrentSession(): Promise<void> {
    this.isLoading.set(true);
    await utils.wait(100);
    this.messages.set([]);
    this.currentSession.set(null);
    this.isLoading.set(false);
  }

  // Sidenav buttons
  protected onLogout(): void {
    this.dialogService.open<SignOutDialog, boolean>(SignOutDialog).subscribe(confirmed => {
      if (confirmed) {
        this.store.dispatch(UserAction.logout());
      }
    });
  }

  protected onPreferences(): void {
    this.snackbarService.info('coming soon');
  }

  protected async onNewChat(): Promise<void> {
    if (!this.currentSession()) return;
    await this.clearCurrentSession();
  }

  // Scroll container
  protected onScroll(e: Event): void {
    const container = e.currentTarget as HTMLElement;
    this.userScrolled.set(container.scrollTop > 100);
  }

  private scrollToBottom(behavior: ScrollBehavior = 'smooth'): void {
    setTimeout(() => {
      this.scrollContainerRef()?.nativeElement.scrollTo({
        top: this.scrollContainerRef()?.nativeElement.scrollHeight,
        behavior,
      });
    });
  }
}
