import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DriverLocation } from '../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tracking`;

  getDriverLocation(orderId: string): Observable<DriverLocation> {
    return this.http.get<DriverLocation>(`${this.apiUrl}/orders/${orderId}`);
  }

  updateDriverLocation(driverId: string, orderId: string, latitude: number, longitude: number): Observable<DriverLocation> {
    return this.http.post<DriverLocation>(`${this.apiUrl}/drivers/${driverId}/location`, { orderId, latitude, longitude });
  }
}
