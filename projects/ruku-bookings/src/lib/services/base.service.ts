import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { catchError, throwError } from 'rxjs';
import { LIB_ENVIRONMENT } from '../environment/environment.token';

@Injectable({ providedIn: 'root' })
export abstract class BaseService {
  protected http = inject(HttpClient);
  protected readonly apiBaseUrl = inject(LIB_ENVIRONMENT).apiBaseUrl;

  protected async get<T>(endpoint: string, options?: any): Promise<HttpResponse<T>> {
    try {
      const response = await lastValueFrom(
        this.http.get<T>(`${this.apiBaseUrl}${endpoint}`, { observe: 'response', ...options }).pipe(catchError(this.handleError))
      );
      if (response instanceof HttpResponse) { this.logResponse('GET', endpoint, response.status); return response; }
      throw new Error('Invalid response type');
    } catch (error) { throw error; }
  }

  protected async post<T>(endpoint: string, data: any, options?: any): Promise<HttpResponse<T>> {
    try {
      const response = await lastValueFrom(
        this.http.post<T>(`${this.apiBaseUrl}${endpoint}`, data, { observe: 'response', ...options }).pipe(catchError(this.handleError))
      );
      if (response instanceof HttpResponse) { this.logResponse('POST', endpoint, response.status); return response; }
      throw new Error('Invalid response type');
    } catch (error) { throw error; }
  }

  protected async put<T>(endpoint: string, data: any, options?: any): Promise<HttpResponse<T>> {
    try {
      const response = await lastValueFrom(
        this.http.put<T>(`${this.apiBaseUrl}${endpoint}`, data, { observe: 'response', ...options }).pipe(catchError(this.handleError))
      );
      if (response instanceof HttpResponse) { this.logResponse('PUT', endpoint, response.status); return response; }
      throw new Error('Invalid response type');
    } catch (error) { throw error; }
  }

  protected async delete<T>(endpoint: string, options?: any): Promise<HttpResponse<T>> {
    try {
      const response = await lastValueFrom(
        this.http.delete<T>(`${this.apiBaseUrl}${endpoint}`, { observe: 'response', ...options }).pipe(catchError(this.handleError))
      );
      if (response instanceof HttpResponse) { this.logResponse('DELETE', endpoint, response.status); return response; }
      throw new Error('Invalid response type');
    } catch (error) { throw error; }
  }

  protected handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
      console.error(`Backend returned code ${error.status}, body was: ${JSON.stringify(error.error)}`);
    }
    console.error('Error details:', errorMessage);
    return throwError(() => error);
  }

  private logResponse(method: string, endpoint: string, status: number): void {
    console.log(`${method} Response Status:`, status);
    console.log(`${method} Endpoint:`, endpoint);
  }

  protected validateRequiredFields(data: any, requiredFields: string[]): boolean {
    return requiredFields.every(field => data[field] !== null && data[field] !== undefined && data[field] !== '');
  }

  protected formatErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.error?.message) return error.error.message;
    if (error?.message) return error.message;
    return 'An unexpected error occurred. Please try again.';
  }
}
