import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import {
  SidenavButton, SessionChip, ChatInputComponent,
  MessageBubble,
} from '@dersim/website/ui';

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
export class Test {

}