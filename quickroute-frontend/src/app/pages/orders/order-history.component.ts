import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order } from '../../models/order.model';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="orders-page">
      <header class="page-heading"><p>VOTRE COMPTE</p><h1>Mes commandes</h1><span>Retrouvez vos commandes et leur état.</span></header>
      @if (loading()) { <div class="state-card">Chargement de vos commandes…</div> }
      @else if (error()) { <div class="state-card error" role="alert">Impossible de charger vos commandes pour le moment. <button type="button" (click)="loadOrders()">Réessayer</button></div> }
      @else if (orders().length === 0) {
        <section class="state-card empty"><span>♧</span><h2>Pas encore de commande</h2><p>Votre prochaine bonne adresse est à quelques clics.</p><a routerLink="/restaurants">Voir les restaurants</a></section>
      } @else {
        <div class="orders-list">
          @for (order of orders(); track order.id) {
            <article class="order-card">
              <div class="order-heading"><div><small>COMMANDE DU {{ order.createdAt | date:'d MMMM yyyy, HH:mm':'':'fr-MA' }}</small><h2>#{{ order.id.slice(0, 8) }}</h2></div><span class="status" [class.delivered]="order.status === 'DELIVERED'">{{ statusLabel(order.status) }}</span></div>
              <p class="address">Livrée à : {{ order.deliveryAddress }}</p>
              <div class="order-foot"><span>{{ order.items.length }} article(s)</span><strong>{{ order.totalAmount | currency:'MAD':'symbol-narrow':'1.2-2':'fr-MA' }}</strong><a [routerLink]="['/orders', order.id, 'tracking']">Suivre la commande →</a></div>
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    :host { display:block; min-height:calc(100vh - 78px); background:#fffefa; color:#283028; }
    .orders-page { max-width:920px; margin:auto; padding:54px 28px 80px; }.page-heading { margin-bottom:26px; }.page-heading p { color:#df6b4a; font-size:10px; font-weight:800; letter-spacing:1.5px; margin:0 0 9px; }.page-heading h1 { font:800 34px Manrope,sans-serif; letter-spacing:-1px; margin:0 0 8px; }.page-heading span { color:#85867e; font-size:13px; }
    .state-card,.order-card { background:white; border:1px solid #eeeae2; border-radius:12px; box-shadow:0 8px 20px #3d38240b; }.state-card { padding:30px; text-align:center; color:#77796f; font-size:13px; }.state-card button { margin-left:9px; border:0; background:none; color:#c7593c; cursor:pointer; }.empty { padding:48px 20px; }.empty>span { font-size:30px; color:#e16b4b; }.empty h2 { margin:11px 0 5px; color:#283028; font:750 20px Manrope,sans-serif; }.empty p { margin:0 0 17px; }.empty a { color:#d65f40; font-size:12px; font-weight:750; text-decoration:none; }.error { color:#ad3f31; }
    .orders-list { display:grid; gap:13px; }.order-card { padding:19px 21px; }.order-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; }.order-heading small { color:#98988f; font-size:9px; font-weight:750; letter-spacing:.7px; }.order-heading h2 { font:750 17px Manrope,sans-serif; margin:5px 0 0; }.status { padding:6px 9px; border-radius:999px; background:#fff1db; color:#9b6921; font-size:10px; font-weight:750; }.status.delivered { background:#eaf3e8; color:#577b50; }.address { color:#73766d; font-size:12px; margin:14px 0; }.order-foot { display:flex; align-items:center; gap:18px; padding-top:12px; border-top:1px solid #f0eee8; font-size:11px; color:#85867e; }.order-foot strong { color:#283028; margin-left:auto; font-size:13px; }.order-foot a { color:#d65f40; font-weight:750; text-decoration:none; }
    @media(max-width:600px) { .orders-page { padding:35px 18px 55px; }.page-heading h1 { font-size:29px; }.order-card { padding:15px; }.order-foot { gap:10px; flex-wrap:wrap; }.order-foot strong { margin-left:auto; }.order-foot a { width:100%; padding-top:7px; } }
  `]
})
export class OrderHistoryComponent implements OnInit {
  private auth = inject(AuthService);
  private service = inject(OrderService);
  orders = signal<Order[]>([]);
  loading = signal(true);
  error = signal(false);

  ngOnInit(): void {
    if (!this.auth.user()?.id) {
      void this.auth.login('/orders');
      return;
    }
    this.loadOrders();
  }

  loadOrders(): void {
    const customerId = this.auth.user()?.id;
    if (!customerId) return;
    this.loading.set(true);
    this.error.set(false);
    this.service.getOrdersByCustomer(customerId).subscribe({
      next: orders => { this.orders.set(orders); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); }
    });
  }

  statusLabel(status: Order['status']): string {
    const labels: Record<Order['status'], string> = {
      CREATED: 'Reçue', PENDING_PAYMENT: 'Paiement en attente', PAID: 'Payée', PREPARING: 'En préparation',
      READY_FOR_PICKUP: 'Prête', IN_DELIVERY: 'En livraison', DELIVERED: 'Livrée', CANCELLED: 'Annulée'
    };
    return labels[status] || status;
  }
}
