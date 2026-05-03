import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from '../../../../store/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  authStore = inject(AuthStore);

  email = signal('');
  password = signal('');
  showPassword = signal(false);

  async submit(): Promise<void> {
    if (!this.email() || !this.password()) return;
    await this.authStore.signIn(this.email(), this.password());
  }
}