import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApplicationStatus, ProfessionalApplication, ProfessionalApplicationService } from '../../services/professional-application.service';

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="admin-page">
      <header><p>ESPACE ADMINISTRATION</p><h1>Demandes professionnelles</h1><span>Vérifiez les informations avant d’activer un compte.</span></header>
      @if (error()) { <div class="notice error" role="alert">Impossible de charger les demandes. Vérifiez que votre compte a le rôle administrateur. <button (click)="load()">Réessayer</button></div> }
      @else if (loading()) { <div class="notice">Chargement des demandes…</div> }
      @else if (!applications().length) { <div class="notice">Aucune demande pour le moment.</div> }
      @else {
        <div class="applications">
          @for (app of applications(); track app.id) {
            <article class="application-card">
              <div class="card-heading"><div><span class="type">{{ app.applicationType === 'RESTAURANT' ? 'RESTAURANT' : 'LIVREUR' }}</span><h2>{{ app.name }}</h2></div><span class="status" [class.approved]="app.status === 'APPROVED'" [class.rejected]="app.status === 'REJECTED'">{{ statusLabel(app.status) }}</span></div>
              <div class="contact"><a [href]="'mailto:' + app.email">{{ app.email }}</a><a [href]="'tel:' + app.phone">{{ app.phone }}</a></div>
              @if (app.address) { <p>{{ app.address }}</p> }
              @if (app.details) { <p class="details">{{ app.details }}</p> }
              <small>Reçue le {{ app.createdAt | date:'d MMMM yyyy, HH:mm':'':'fr-MA' }}</small>
              @if (app.status === 'PENDING') { <div class="actions"><button type="button" class="reject" [disabled]="busy() === app.id" (click)="review(app, 'REJECTED')">Refuser</button><button type="button" class="approve" [disabled]="busy() === app.id" (click)="review(app, 'APPROVED')">{{ busy() === app.id ? 'Enregistrement…' : 'Approuver' }}</button></div> }
            </article>
          }
        </div>
      }
      <a class="back" routerLink="/restaurants">← Retour aux restaurants</a>
    </section>
  `,
  styles: [`
    :host { display:block; min-height:calc(100vh - 78px); background:#fffefa; color:#283028; }.admin-page { max-width:900px; margin:auto; padding:48px 24px 70px; }header p { margin:0 0 8px; color:#d96949; font-size:10px; font-weight:800; letter-spacing:1.5px; }header h1 { margin:0 0 7px; font:800 31px Manrope,sans-serif; letter-spacing:-.7px; }header>span { color:#85867e; font-size:13px; }.applications { display:grid; gap:12px; margin-top:25px; }.application-card,.notice { border:1px solid #eeeae2; border-radius:11px; background:white; padding:19px 21px; box-shadow:0 8px 20px #3d38240b; }.card-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:15px; }.type { color:#d96949; font-size:9px; font-weight:850; letter-spacing:1px; }.card-heading h2 { margin:5px 0 0; font:750 17px Manrope,sans-serif; }.status { padding:5px 8px; border-radius:20px; background:#fff1db; color:#94651e; font-size:10px; font-weight:750; }.status.approved { background:#eaf3e8; color:#577b50; }.status.rejected { background:#fff0ed; color:#a83d32; }.contact { display:flex; flex-wrap:wrap; gap:15px; margin-top:13px; }.contact a { color:#4d584b; font-size:12px; text-decoration:none; }.application-card p { margin:8px 0 0; color:#666a60; font-size:12px; }.details { white-space:pre-wrap; }.application-card>small { display:block; margin-top:12px; color:#99998f; font-size:10px; }.actions { display:flex; justify-content:flex-end; gap:8px; margin-top:14px; padding-top:12px; border-top:1px solid #f0eee8; }.actions button,.notice button { border:1px solid #e8e5dd; border-radius:6px; padding:8px 12px; background:white; color:#596056; font-size:11px; font-weight:750; cursor:pointer; }.actions .approve { border-color:#29352b; background:#29352b; color:white; }.actions button:disabled { opacity:.5; }.notice { margin-top:25px; color:#77796f; font-size:12px; }.notice.error { color:#a83d32; }.back { display:block; margin-top:20px; color:#bf6043; font-size:12px; text-align:center; text-decoration:none; }
  `]
})
export class AdminApplicationsComponent implements OnInit {
  private service = inject(ProfessionalApplicationService);
  applications = signal<ProfessionalApplication[]>([]);
  loading = signal(true);
  error = signal(false);
  busy = signal<string | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true); this.error.set(false);
    this.service.all().subscribe({ next: rows => { this.applications.set(rows); this.loading.set(false); }, error: () => { this.error.set(true); this.loading.set(false); } });
  }

  review(application: ProfessionalApplication, status: 'APPROVED' | 'REJECTED'): void {
    this.busy.set(application.id);
    this.service.review(application.id, status).subscribe({
      next: updated => { this.applications.update(rows => rows.map(row => row.id === updated.id ? updated : row)); this.busy.set(null); },
      error: () => { this.error.set(true); this.busy.set(null); }
    });
  }

  statusLabel(status: ApplicationStatus): string {
    return { PENDING: 'En attente', APPROVED: 'Approuvée', REJECTED: 'Refusée' }[status];
  }
}
