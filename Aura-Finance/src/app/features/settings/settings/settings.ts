import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../../store/auth.store';
import { StorageService } from '../../../core/services/storage.service';
import { BudgetStore } from '../../../store/budget.store';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink, MatIconModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  authStore = inject(AuthStore);
  storageService = inject(StorageService);
  budgetStore = inject(BudgetStore);

  showDeleteConfirm = signal(false);
  exportSuccess = signal(false);
  importSuccess = signal(false);

  exportData(): void {
    const data = this.storageService.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-finance-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.exportSuccess.set(true);
    setTimeout(() => this.exportSuccess.set(false), 3000);
  }

  importData(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        this.storageService.importData(data);
        this.budgetStore.loadAll();
        this.importSuccess.set(true);
        setTimeout(() => this.importSuccess.set(false), 3000);
      } catch {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  }

  clearAllData(): void {
    this.storageService.clearAll();
    this.budgetStore.loadAll();
    this.showDeleteConfirm.set(false);
  }
}