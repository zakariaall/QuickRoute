import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type ApplicationType = 'RESTAURANT' | 'DRIVER';
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ProfessionalApplication {
  id: string;
  applicantId: string;
  applicationType: ApplicationType;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  details: string | null;
  status: ApplicationStatus;
  createdAt: string;
}

export interface NewProfessionalApplication {
  applicationType: ApplicationType;
  name: string;
  email: string;
  phone: string;
  address?: string;
  details?: string;
}

export interface ReviewProfessionalApplication {
  status: ApplicationStatus;
}

@Injectable({ providedIn: 'root' })
export class ProfessionalApplicationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/applications`;

  submit(payload: NewProfessionalApplication): Observable<ProfessionalApplication> {
    return this.http.post<ProfessionalApplication>(this.apiUrl, payload);
  }

  mine(): Observable<ProfessionalApplication[]> {
    return this.http.get<ProfessionalApplication[]>(`${this.apiUrl}/mine`);
  }

  all(): Observable<ProfessionalApplication[]> {
    return this.http.get<ProfessionalApplication[]>(this.apiUrl);
  }

  review(id: string, status: 'APPROVED' | 'REJECTED'): Observable<ProfessionalApplication> {
    return this.http.patch<ProfessionalApplication>(`${this.apiUrl}/${id}/status`, { status } satisfies ReviewProfessionalApplication);
  }
}
