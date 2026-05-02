import { Component, inject, signal, computed } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { BudgetStore } from '../../../store/budget.store';
import { SectionType, BudgetTable } from '../../../core/models';

export interface SectionDialogData {
  sectionType: SectionType;
  month: string;
}

@Component({
  selector: 'app-section-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, FormsModule, CurrencyPipe],
  templateUrl: './section-dialog.component.html',
})
export class SectionDialogComponent {
  dialogRef = inject(MatDialogRef<SectionDialogComponent>);
  data = inject<SectionDialogData>(MAT_DIALOG_DATA);
  budgetStore = inject(BudgetStore);

  newTableName = signal('');
  showNewTableInput = signal(false);

  section = computed(() => {
    const budget = this.budgetStore.currentBudget();
    return budget?.sections.find(s => s.type === this.data.sectionType) ?? null;
  });

  sectionTotal = computed(() => {
    const s = this.section();
    if (!s) return 0;
    return s.tables.reduce((tAcc, t) =>
      tAcc + t.rows.reduce((rAcc, r) => rAcc + (r.amount || 0), 0), 0
    );
  });

  tableTotal(table: BudgetTable): number {
    return table.rows.reduce((acc, r) => acc + (r.amount || 0), 0);
  }

  sectionLabel(): string {
    const map: Record<SectionType, string> = {
      income: 'Income',
      savings: 'Savings',
      expenses: 'Expenses',
    };
    return map[this.data.sectionType];
  }

  addTable(): void {
    const name = this.newTableName().trim();
    if (!name) return;
    this.budgetStore.addTable(this.data.sectionType, name);
    this.newTableName.set('');
    this.showNewTableInput.set(false);
  }

  addRow(tableId: string): void {
    this.budgetStore.addRow(this.data.sectionType, tableId);
  }

  updateRow(tableId: string, rowId: string, field: 'label' | 'amount', value: string): void {
    const budget = this.budgetStore.currentBudget();
    if (!budget) return;
    const section = budget.sections.find(s => s.type === this.data.sectionType);
    if (!section) return;
    const table = section.tables.find(t => t.id === tableId);
    if (!table) return;
    const row = table.rows.find(r => r.id === rowId);
    if (!row) return;
    const updated = {
      ...row,
      [field]: field === 'amount' ? parseFloat(value) || 0 : value,
    };
    this.budgetStore.updateRow(this.data.sectionType, tableId, updated);
  }

  deleteRow(tableId: string, rowId: string): void {
    this.budgetStore.deleteRow(this.data.sectionType, tableId, rowId);
  }

  deleteTable(tableId: string): void {
    this.budgetStore.deleteTable(this.data.sectionType, tableId);
  }

  close(): void {
    this.dialogRef.close();
  }
}