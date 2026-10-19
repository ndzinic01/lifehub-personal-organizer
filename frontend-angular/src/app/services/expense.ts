import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum TransactionType {
  Expense = 0,
  Income = 1
}

export interface ExpenseCategory{
  id: number;
  name: string;
  type: TransactionType;
}

export interface TransactionItem {
  id: number;
  amount: number;
  type: TransactionType;
  description: string | null;
  date: string;
  categoryId: number;
  categoryName: string;
}

export interface CreateTransactionDto {
  amount: number;
  type: TransactionType;
  description: string | null;
  date: string;
  categoryId: number;
}

@Injectable({
  providedIn: 'root',
})
export class Expense {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'https://localhost:7135/api';

  getCategories(): Observable<ExpenseCategory[]>{
    return this.http.get<ExpenseCategory[]>(`${this.apiBaseUrl}/categories`,);
  }

  getTransactions(): Observable<TransactionItem[]>{
    return this.http.get<TransactionItem[]>(`${this.apiBaseUrl}/transactions`,
      );
  }

  createTransaction(
    transaction: CreateTransactionDto,): Observable<TransactionItem>{
    return this.http.post<TransactionItem>(`${this.apiBaseUrl}/transactions`,transaction);
  }

  deleteTransaction(id:number):Observable<void>{
    return this.http.delete<void>(`${this.apiBaseUrl}/transactions/${id}`);
  }
}
