import { CommonModule } from '@angular/common';
import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, switchMap, timer } from 'rxjs';
import { DriverLocation, Order } from '../../models/order.model';
import { OrderService } from '../../services/order.service';
import { TrackingService } from '../../services/tracking.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      @if (loading()) {
        <section class="state-card">Chargement de votre commande…</section>
      } @else if (error()) {
        <section class="state-card error" role="alert">Cette commande est indisponible. Vérifiez votre connexion ou retournez à vos commandes.
          <a routerLink="/orders">Mes commandes</a>
        </section>
      } @else if (order(); as ord) {
        <div class="tracking-card">
          <div class="header">
            <div><h2>Suivi de votre commande</h2><span class="status">{{ statusLabel(ord.status) }}</span></div>
            <span class="order-id">#{{ ord.id }}</span>
          </div>

          @if (ord.status !== 'CANCELLED') {
            <div class="steps-progress" aria-label="Progression de la commande">
              <div class="step" [class.active]="isStepActive(ord.status, 1)"><span class="icon">📝</span><span class="label">Reçue</span></div>
              <div class="line" [class.active]="isStepActive(ord.status, 2)"></div>
              <div class="step" [class.active]="isStepActive(ord.status, 2)"><span class="icon">🍳</span><span class="label">En cuisine</span></div>
              <div class="line" [class.active]="isStepActive(ord.status, 3)"></div>
              <div class="step" [class.active]="isStepActive(ord.status, 3)"><span class="icon">🛵</span><span class="label">En livraison</span></div>
              <div class="line" [class.active]="isStepActive(ord.status, 4)"></div>
              <div class="step" [class.active]="isStepActive(ord.status, 4)"><span class="icon">✅</span><span class="label">Livrée</span></div>
            </div>
          } @else {
            <p class="cancelled">Cette commande a été annulée.</p>
          }

          @if (ord.status === 'IN_DELIVERY' || driver()) {
            <section class="driver-card">
              <h3>Position du livreur</h3>
              @if (coordinates(); as coords) {
                <p>Dernière position reçue : <strong>{{ coords[1] }}, {{ coords[0] }}</strong></p>
                @if (driver()?.updatedAt) { <small>Mise à jour : {{ driver()?.updatedAt | date:'HH:mm:ss':'':'fr-MA' }}</small> }
              } @else {
                <p>La position GPS du livreur n’a pas encore été transmise.</p>
              }
            </section>
          }

          <div class="summary">
            <h3>Détails des articles</h3>
            <ul>
              @for (item of ord.items; track item.id || item.productId) {
                <li><span>{{ item.quantity }}× {{ item.productName }}</span><span>{{ (item.price * item.quantity) | currency:'MAD':'symbol-narrow':'1.2-2':'fr-MA' }}</span></li>
              }
            </ul>
            <div class="total"><strong>Total de la commande :</strong><span>{{ ord.totalAmount | currency:'MAD':'symbol-narrow':'1.2-2':'fr-MA' }}</span></div>
          </div>
          <div class="actions"><a routerLink="/restaurants" class="btn-back">← Retour aux restaurants</a></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .container { max-width:800px; margin:0 auto; padding:2rem 1rem; font-family:system-ui,sans-serif; color:#283028; }
    .tracking-card,.state-card { background:#fff; border:1px solid #e8e5dd; border-radius:16px; padding:2rem; box-shadow:0 4px 18px #25251b0a; }
    .state-card { text-align:center; color:#6e7168; }.state-card a { display:block; margin-top:12px; color:#cf6142; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; gap:15px; border-bottom:1px solid #f1eee8; padding-bottom:1rem; }.header h2 { margin:0 0 9px; color:#283028; font-size:1.5rem; }.order-id { font-family:monospace; color:#85867e; font-size:.85rem; overflow-wrap:anywhere; text-align:right; }.status { color:#ab623e; background:#fff2e9; border-radius:30px; padding:5px 10px; font-size:12px; font-weight:700; }
    .steps-progress { display:flex; align-items:center; justify-content:space-between; margin:2.3rem 0; }.step { display:flex; flex-direction:column; align-items:center; opacity:.4; text-align:center; }.step.active { opacity:1; font-weight:700; }.icon { font-size:1.7rem; margin-bottom:.25rem; }.label { font-size:.78rem; color:#374036; }.line { flex:1; height:3px; background:#e8e5dd; margin:0 .4rem; position:relative; top:-9px; }.line.active { background:#6f9164; }
    .driver-card { margin:1.5rem 0; padding:18px; background:#f8f7f2; border:1px solid #eeece5; border-radius:10px; }.driver-card h3 { margin:0 0 8px; font-size:14px; }.driver-card p { margin:0; color:#666a60; font-size:13px; }.driver-card small { display:block; margin-top:7px; color:#888a82; font-size:11px; }.cancelled { padding:14px; color:#a83d32; background:#fff4f1; border-radius:8px; }
    .summary h3 { margin-top:1.7rem; font-size:1.05rem; color:#394239; }.summary ul { list-style:none; padding:0; margin:0 0 1rem; }.summary li { display:flex; justify-content:space-between; gap:15px; padding:.6rem 0; border-bottom:1px solid #f3f1eb; font-size:13px; }.total { display:flex; justify-content:space-between; gap:15px; font-size:1rem; border-top:1px solid #e8e5dd; padding-top:.8rem; }.actions { margin-top:2rem; text-align:center; }.btn-back { color:#bd5a3d; text-decoration:none; font-weight:650; font-size:13px; }.error { color:#a83d32; }
    @media(max-width:560px) { .container { padding:1rem .75rem; }.tracking-card,.state-card { padding:1.2rem; }.header h2 { font-size:1.2rem; }.steps-progress { margin:1.5rem 0; }.icon { font-size:1.35rem; }.label { font-size:.65rem; }.line { margin:0 .2rem; } }
  `]
})
export class OrderTrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private trackingService = inject(TrackingService);
  private destroyRef = inject(DestroyRef);
  order = signal<Order | null>(null);
  driver = signal<DriverLocation | null>(null);
  loading = signal(true);
  error = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loading.set(false); this.error.set(true); return; }

    timer(0, 5000).pipe(
      switchMap(() => this.orderService.getOrderById(id).pipe(catchError(() => of(null)))),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(order => {
      if (!order) { if (!this.order()) { this.loading.set(false); this.error.set(true); } return; }
      this.order.set(order);
      this.loading.set(false);
      this.error.set(false);
    });

    timer(0, 7000).pipe(
      switchMap(() => this.trackingService.getDriverLocation(id).pipe(catchError(() => of(null)))),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(location => this.driver.set(location));
  }

  coordinates(): number[] | null {
    const point = this.driver()?.location;
    if (!point) return null;
    if (Array.isArray(point.coordinates) && point.coordinates.length >= 2) return point.coordinates;
    if (typeof point.x === 'number' && typeof point.y === 'number') return [point.x, point.y];
    return null;
  }

  statusLabel(status: Order['status']): string {
    const labels: Record<Order['status'], string> = {
      CREATED: 'Reçue', PENDING_PAYMENT: 'Paiement en attente', PAID: 'Payée', PREPARING: 'En préparation',
      READY_FOR_PICKUP: 'Prête', IN_DELIVERY: 'En livraison', DELIVERED: 'Livrée', CANCELLED: 'Annulée'
    };
    return labels[status];
  }

  isStepActive(status: Order['status'], step: number): boolean {
    const ranks: Record<Order['status'], number> = {
      CREATED: 1, PENDING_PAYMENT: 1, PAID: 2, PREPARING: 2,
      READY_FOR_PICKUP: 3, IN_DELIVERY: 3, DELIVERED: 4, CANCELLED: 0
    };
    return ranks[status] >= step;
  }
}
