import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrderRequest, Order } from '../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  createOrder(order: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getOrdersByCustomer(customerId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  getOrdersByRestaurant(restaurantId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/restaurant/${restaurantId}`);
  }

  getAvailableDeliveries(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/deliveries/available`);
  }

  getMyDeliveries(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/deliveries/mine`);
  }

  acceptDelivery(id: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/deliveries/${id}/accept`, {});
  }

  completeDelivery(id: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/deliveries/${id}/complete`, {});
  }

  updateStatus(id: string, status: Order['status']): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, null, { params: { status } });
  }
}
