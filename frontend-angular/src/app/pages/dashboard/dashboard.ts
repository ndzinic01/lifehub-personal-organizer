import {DatePipe, DecimalPipe} from '@angular/common';
import {forkJoin} from 'rxjs';
import { ChangeDetectorRef ,Component, inject, OnInit } from '@angular/core';
import { RouterLink} from '@angular/router';
import {Task, TaskItem, TaskStatus} from '../../services/task';
import {Expense,
MonthlyBudgetDto,
TransactionItem,
TransactionType} from '../../services/expense';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly taskService = inject(Task);
  private readonly expenseService = inject(Expense);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly TaskStatus = TaskStatus;
  readonly budgetYear = new Date().getFullYear();
  readonly budgetMonth = new Date().getMonth() + 1;

  transactions: TransactionItem[] = [];
  monthlyBudget: MonthlyBudgetDto = {
    year: this.budgetYear,
    month: this.budgetMonth,
    amount: 0,
  };

  financeLoading = true;
  financeErrorMessage = '';
  tasks: TaskItem[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit() {
    this.taskService.getTasks().subscribe({
      next: (task) => {
        this.tasks = task;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Nije moguće učitati zadatke. Provjeri je li backend pokrenut.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });

    forkJoin({
      transactions: this.expenseService.getTransactions(),
      budget: this.expenseService.getMonthlyBudget(
        this.budgetYear,
        this.budgetMonth,
      ),
    }).subscribe({
      next: (data) => {
        this.transactions = data.transactions;
        this.monthlyBudget = data.budget;
        this.financeLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.financeErrorMessage = 'Nije moguće učitati finansijski pregled.';
        this.financeLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  get inProgressCount(): number {
    return this.tasks.filter((task) => task.status === TaskStatus.InProgress).length;
  }

  get completedCount(): number {
    return this.tasks.filter((task) => task.status === TaskStatus.Completed).length;
  }

  get overdueCount(): number {
    const now = new Date();

    return this.tasks.filter(
      (task) =>
        task.status !== TaskStatus.Completed &&
        task.dueDate !== null &&
        task.dueDate !== undefined &&
        new Date(task.dueDate) < now,
    ).length;
  }

  get completionPercentage(): number {
    if (this.tasks.length === 0) {
      return 0;
    }
    return Math.round((this.completedCount / this.tasks.length) * 100);
  }

  get todayTasks(): TaskItem[] {
    const today = new Date().toDateString();

    return this.tasks
      .filter(
        (task) =>
          task.dueDate &&
          new Date(task.dueDate).toDateString() === today &&
          task.status !== TaskStatus.Completed,
      )
      .splice(0, 4);
  }
  private get currentMonthKey():string {
    return `${this.budgetYear}-${String(this.budgetMonth).padStart(2, '0')}`;
  }

  private getMonthlyTotal(type: TransactionType): number{
    return this.transactions
      .filter((transaction) => transaction.type === type
      && transaction.date.slice(0,7) === this.currentMonthKey,
        )
      .reduce((total, transaction) => total + transaction.amount,0 );
  }
  get monthlyIncome():number{
    return this.getMonthlyTotal(TransactionType.Income);
  }

  get monthlyExpenses(): number {
    return this.getMonthlyTotal(TransactionType.Expense);
  }

  get remainingBudget():number{
    return this.monthlyBudget.amount - this.monthlyExpenses
  }
  get upcomingTasks(): TaskItem[] {
    const today = new Date();
    today.setHours(0,0,0,0);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate()+7);

    return this.tasks
      .filter((task) => {
        if (!task.dueDate || task.status === TaskStatus.Completed)
        {
          return false;
        }
        const dueDate = new Date(`${task.dueDate.slice(0,10)}T00:00:00`);

        return dueDate > today && dueDate <= nextWeek;
      })
      .sort((first, second) =>
       new Date(first.dueDate!).getTime() - new Date(second.dueDate!).getTime(),
      ).slice(0,5);
  }

}
