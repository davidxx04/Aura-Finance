import { Component, inject, input, signal, ViewChild, ElementRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { BudgetStore } from '../../../store/budget.store';
import { SectionDialogComponent } from '../section-dialog/section-dialog.component';
import { SectionType } from '../../../core/models';

@Component({
  selector: 'app-budget-cards',
  standalone: true,
  imports: [CurrencyPipe, MatIconModule, MatDialogModule, FormsModule],
  templateUrl: './budget-cards.component.html',
  styleUrl: './budget-cards.component.css'
})
export class BudgetCardsComponent {
  month = input.required<string>();

  budgetStore = inject(BudgetStore);
  dialog = inject(MatDialog);

  editingExtraSavings = signal(false);
  extraSavingsValue = signal(0);

  @ViewChild('extraInput') extraInput?: ElementRef<HTMLInputElement>;

  sections = [
    {
      type: 'income' as SectionType,
      label: 'Income',
      icon: 'trending_up',
      iconColor: '#34d399',
      bgColor: 'rgba(52,211,153,0.1)',
      valueColor: '#34d399',
      value: this.budgetStore.currentIncome,
    },
    {
      type: 'expenses' as SectionType,
      label: 'Expenses',
      icon: 'trending_down',
      iconColor: '#f87171',
      bgColor: 'rgba(248,113,113,0.1)',
      valueColor: '#f87171',
      value: this.budgetStore.currentExpenses,
    },
    {
      type: 'savings' as SectionType,
      label: 'Savings',
      icon: 'savings',
      iconColor: '#a78bfa',
      bgColor: 'rgba(167,139,250,0.1)',
      valueColor: '#a78bfa',
      value: this.budgetStore.currentSavings,
    },
  ];

  openDialog(sectionType: SectionType): void {
    this.dialog.open(SectionDialogComponent, {
      data: { sectionType, month: this.month() },
      panelClass: 'dark-dialog',
      backdropClass: 'dark-backdrop',
    });
  }

  startEditExtraSavings(): void {
    this.extraSavingsValue.set(this.budgetStore.currentExtraSavings());
    this.editingExtraSavings.set(true);
    setTimeout(() => {
      if (this.extraInput) {
        this.extraInput.nativeElement.focus();
        this.extraInput.nativeElement.select();
      }
    });
  }

  saveExtraSavings(): void {
    this.budgetStore.updateExtraSavings(this.extraSavingsValue());
    this.editingExtraSavings.set(false);
  }
}