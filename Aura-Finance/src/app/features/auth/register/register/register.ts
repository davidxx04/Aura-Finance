import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from '../../../../store/auth.store';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, MatIconModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  authStore = inject(AuthStore);
  router = inject(Router);

  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  showPassword = signal(false);
  success = signal(false);

  async submit(): Promise<void> {
    if (!this.email() || !this.password()) return;
    if (this.password() !== this.confirmPassword()) {
      return;
    }
    await this.authStore.signUp(this.email(), this.password());
    if (!this.authStore.error()) {
      this.success.set(true);
    }
  }

  get passwordMismatch(): boolean {
    return this.confirmPassword().length > 0 && this.password() !== this.confirmPassword();
  }
}