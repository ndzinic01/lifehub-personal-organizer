import {DatePipe, DecimalPipe} from '@angular/common';
import {ChangeDetectorRef, Component, OnInit, inject} from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import {forkJoin} from 'rxjs';
import {CreateTransactionDto,
  ExpenseCategory,
  Expense,
  MonthlyBudgetDto,
  TransactionItem,
  TransactionType}
  from '../../services/expense';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule],
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss',
})
export class Expenses implements OnInit {
  private readonly expenseService = inject(Expense);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly TransactionType = TransactionType;
  readonly budgetYear = new Date().getFullYear();
  readonly budgetMonth = new Date().getMonth() + 1;

  categories: ExpenseCategory[] = [];
  transactions: TransactionItem[] = [];

  loading = true;
  saving = false;
  errorMessage = '';

  newTransaction: CreateTransactionDto = this.createEmptyTransaction();
  editingTransactionId: number | null = null;

  monthlyBudget: MonthlyBudgetDto = {
    year: this.budgetYear,
    month: this.budgetMonth,
    amount: 0,
  };

  budgetInput = 0;
  budgetSaving = false;
  budgetErrorMessage = '';

  ngOnInit() {
    this.loadData();
  }

  get filteredCategories(): ExpenseCategory[] {
    return this.categories.filter(
      (category) =>category.type === this.newTransaction.type,
    );
  }

  get totalIncome():number {
    return this.transactions
      .filter((transaction) => transaction.type === TransactionType.Income,)
      .reduce((total, transaction) => total + transaction.amount, 0);
  }

  get totalExpenses(): number {
    return this.transactions
      .filter( (transaction) => transaction.type === TransactionType.Expense,)
      .reduce((total, transaction) => total + transaction.amount, 0);
  }

  get balance(): number{
    return this.totalIncome - this.totalExpenses;
  }

  loadData():void{
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      categories: this.expenseService.getCategories(),
      transactions: this.expenseService.getTransactions(),
      budget: this.expenseService.getMonthlyBudget(
        this.budgetYear,
        this.budgetMonth,
      ),
    }).subscribe({
      next: (data) => {
        this.categories = data.categories;
        this.transactions = data.transactions;
        this.monthlyBudget = data.budget;
        this.budgetInput = data.budget.amount;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Nije moguće učitati troškove. Provjerite da je backend pokrenut.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onTypeChanged(type: TransactionType) {
    this.newTransaction.type = type;

    const selectedCategoryExist = this.categories.some(
      (category) => category.id ===
    this.newTransaction.categoryId && category.type === type,);

    if(!selectedCategoryExist){
      this.newTransaction.categoryId = 0;
    }
  }

  saveTransaction(form: NgForm){
    if ( form.invalid || this.newTransaction.categoryId === 0 || this.saving)
    {
      return;
    }
    this.saving = true;
    this.errorMessage = '';

    const transactionToSave: CreateTransactionDto = {
      ...this.newTransaction,
      description: this.newTransaction.description?.trim() || null,
      date: `${this.newTransaction.date}T00:00:00`,
    };

    if (this.editingTransactionId !== null) {
      const id = this.editingTransactionId;

      this.expenseService.updateTransaction(id, transactionToSave).subscribe({
        next: () => {
          const categoryName = this.categories.find(
            (category) => category.id === transactionToSave.categoryId,
          )?.name ?? '';

          this.transactions = this.transactions.map((transaction) =>
            transaction.id === id
              ? {
                  ...transaction,
                  ...transactionToSave,
                  categoryName,
                }
              : transaction,
          );

          this.saving = false;
          this.cancelEdit();
          form.resetForm(this.newTransaction);
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Nije moguće izmijeniti transakciju. Pokušajte ponovo. ';
          this.saving = false;
          this.cdr.markForCheck();
        },
      });
      return;
    }

    this.expenseService.createTransaction(transactionToSave).subscribe({
      next: (transaction) => {
        this.transactions = [transaction, ...this.transactions];
        this.saving = false;
        this.newTransaction = this.createEmptyTransaction();
        form.resetForm(this.newTransaction);
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Nije moguće sačuvati transakciju. Pokušajte ponovo.';
        this.saving = false;
        this.cdr.markForCheck();
      },
    });
  }

  private createEmptyTransaction(): CreateTransactionDto{
    return {
      amount: 0,
      type: TransactionType.Expense,
      description: '',
      date: '',
      categoryId: 0,
    };
  }
  deleteTransaction(id: number):void{
    const confirmed = window.confirm('Želiš li obbrisati ovu transakciju?');
    if (!confirmed){
      return;
    }
    this.errorMessage = '';

    this.expenseService.deleteTransaction(id).subscribe({
      next: () => {
        this.transactions = this.transactions.filter(
          (transaction) => transaction.id !== id,
        );
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Nije moguće obrisati ovu transakciju. Pokušajte ponovo';
        this.cdr.markForCheck();
      },
    });
  }
  editTransaction(transaction: TransactionItem){
    this.editingTransactionId = transaction.id;

    this.newTransaction = {
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description ?? '',
      date: transaction.date.substring(0,10),
      categoryId: transaction.categoryId,
    };
  }

  cancelEdit():void{
    this.editingTransactionId = null;
    this.newTransaction = this.createEmptyTransaction();
  }

  get currentMonthExpenses(): number {
    const currentMonth = `${this.budgetYear}-${String(this.budgetMonth).padStart(2,'0')}`;

    return this.transactions
      .filter((transaction) => transaction.type === TransactionType.Expense
      && transaction.date.slice(0,7) === currentMonth,
        )
      .reduce((total, transaction) => total + transaction.amount,0)
  }

  get remainingBudget():number{
    return this.monthlyBudget.amount - this.currentMonthExpenses;
  }

  saveMonthlyBudget(){
    if (this.budgetInput < 0.01 || this.budgetSaving){
      return;
    }
    this.budgetSaving = true;
    this.budgetErrorMessage = '';

    this.expenseService
      .setMonthlyBudget(this.budgetYear, this.budgetMonth, this.budgetInput)
      .subscribe({
        next: (budget) => {
          this.monthlyBudget = budget;
          this.budgetInput = budget.amount;
          this.budgetSaving = false;
          this.cdr.markForCheck()
        },
        error: () => {
          this.budgetErrorMessage = 'Nije moguće sačuvati budžet. Pokušajte ponovo.';
          this.budgetSaving = false;
          this.cdr.markForCheck();
        },
      });
  }
}

