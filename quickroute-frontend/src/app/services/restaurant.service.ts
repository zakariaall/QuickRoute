import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Product, Restaurant } from '../models/restaurant.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/restaurants`;

  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(this.apiUrl);
  }

  getRestaurantById(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.apiUrl}/${id}`);
  }

  getMyRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}/mine`);
  }

  createRestaurant(payload: { name: string; description: string; address: string; phone: string }): Observable<Restaurant> {
    return this.http.post<Restaurant>(this.apiUrl, payload);
  }

  updateRestaurant(id: string, payload: Partial<Pick<Restaurant, 'name' | 'description' | 'address' | 'phone' | 'status'>>): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.apiUrl}/${id}`, payload);
  }

  createCategory(payload: { name: string; restaurantId: string }): Observable<Category> {
    return this.http.post<Category>(`${environment.apiUrl}/categories`, payload);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/categories/${id}`);
  }

  createProduct(payload: { name: string; description: string; price: number; categoryId: string }): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/products`, payload);
  }

  updateProduct(id: string, payload: Partial<Pick<Product, 'available'>>): Observable<Product> {
    return this.http.put<Product>(`${environment.apiUrl}/products/${id}`, payload);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/products/${id}`);
  }
}
