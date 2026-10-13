import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Order } from '../../models/order.model';
import { Restaurant } from '../../models/restaurant.model';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { ProfessionalApplication, ProfessionalApplicationService } from '../../services/professional-application.service';
import { RestaurantService } from '../../services/restaurant.service';

@Component({
  selector: 'app-restaurant-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="manage-page">
      <header class="page-heading"><p>ESPACE RESTAURANT</p><h1>Gérez votre établissement</h1><span>Fiche, menu et commandes réunis au même endroit.</span></header>
      @if (loading()) { <div class="state-card">Chargement de votre espace…</div> }
      @else if (!approved()) {
        <section class="state-card"><span class="state-icon">⌛</span><h2>Votre demande est encore en attente</h2><p>Nous vous donnerons accès à la gestion dès qu’elle aura été approuvée.</p><a routerLink="/register">Voir mes demandes</a></section>
      } @else if (!restaurant()) {
        <form class="panel create-form" (ngSubmit)="createRestaurant()">
          <h2>Créer la fiche du restaurant</h2><p>Votre fiche sera visible par les clients après sa création.</p>
          <label for="r-name">Nom</label><input id="r-name" name="name" [(ngModel)]="name" required maxlength="180">
          <label for="r-description">Présentation</label><textarea id="r-description" name="description" [(ngModel)]="description" rows="3" maxlength="2000"></textarea>
          <div class="two-fields"><div><label for="r-address">Adresse</label><input id="r-address" name="address" [(ngModel)]="address" required maxlength="500"></div><div><label for="r-phone">Téléphone</label><input id="r-phone" name="phone" [(ngModel)]="phone" maxlength="30"></div></div>
          @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
          <button class="primary" [disabled]="busy()">{{ busy() ? 'Enregistrement…' : 'Créer ma fiche' }}</button>
        </form>
      } @else {
        <div class="restaurant-heading panel">
          <div><span class="eyebrow">{{ restaurant()?.status === 'OPEN' ? 'OUVERT AUX COMMANDES' : 'FERMÉ AUX COMMANDES' }}</span><h2>{{ restaurant()?.name }}</h2><p>{{ restaurant()?.address }}</p></div>
          <button class="secondary" type="button" [disabled]="busy()" (click)="toggleOpen()">{{ restaurant()?.status === 'OPEN' ? 'Fermer temporairement' : 'Ouvrir le restaurant' }}</button>
        </div>

        @if (error()) { <div class="notice error" role="alert">{{ error() }}</div> }

        <section class="panel menu-panel">
          <div class="section-heading"><div><span class="eyebrow">VOTRE CARTE</span><h2>Menu</h2></div></div>
          @for (category of restaurant()?.categories || []; track category.id) {
            <article class="category-card">
              <div class="category-heading"><h3>{{ category.name }}</h3><button class="text-danger" type="button" (click)="deleteCategory(category.id)">Supprimer la catégorie</button></div>
              @for (product of category.products; track product.id) {
                <div class="product-row"><div><strong>{{ product.name }}</strong><small>{{ product.description || 'Aucune description' }}</small></div><span>{{ product.price | currency:'MAD':'symbol-narrow':'1.2-2':'fr-MA' }}</span><button type="button" class="availability" [class.off]="!product.available" (click)="toggleProduct(product.id, product.available)">{{ product.available ? 'Disponible' : 'Épuisé' }}</button><button class="text-danger" type="button" aria-label="Supprimer le plat" (click)="deleteProduct(product.id)">×</button></div>
              }
              <form class="add-product" (ngSubmit)="addProduct(category.id)"><input [name]="'product-name-' + category.id" [(ngModel)]="productNames[category.id]" required placeholder="Nom du plat"><input [name]="'product-price-' + category.id" [(ngModel)]="productPrices[category.id]" type="number" min="0.01" step="0.01" required placeholder="Prix MAD"><button class="secondary" [disabled]="busy()">Ajouter un plat</button></form>
            </article>
          }
          @if (!(restaurant()?.categories?.length)) { <p class="muted">Ajoutez une catégorie pour commencer à composer votre menu.</p> }
          <form class="add-category" (ngSubmit)="addCategory()"><input name="categoryName" [(ngModel)]="categoryName" required maxlength="180" placeholder="Nouvelle catégorie, ex. Plats principaux"><button class="primary" [disabled]="busy()">Ajouter une catégorie</button></form>
        </section>

        <section class="panel orders-panel">
          <div class="section-heading"><div><span class="eyebrow">À PRÉPARER</span><h2>Commandes</h2></div><button class="link-button" type="button" (click)="loadOrders()">Actualiser</button></div>
          @if (ordersLoading()) { <p class="muted">Chargement des commandes…</p> }
          @else if (!orders().length) { <p class="muted">Aucune commande pour le moment.</p> }
          @else { @for (order of orders(); track order.id) {
            <article class="order-row"><div class="order-title"><strong>Commande #{{ order.id.slice(0, 8) }}</strong><span>{{ order.createdAt | date:'d MMM, HH:mm':'':'fr-MA' }}</span></div><p>{{ order.items.length }} article(s) · {{ order.totalAmount | currency:'MAD':'symbol-narrow':'1.2-2':'fr-MA' }}</p><p class="muted">Livraison : {{ order.deliveryAddress }}</p><div class="order-action"><span class="order-status">{{ orderStatus(order.status) }}</span>@if (nextStatus(order.status); as next) { <button class="secondary" type="button" [disabled]="busy()" (click)="advanceOrder(order, next)">{{ next === 'PREPARING' ? 'Commencer la préparation' : 'Marquer prête' }}</button> } @else if (order.status === 'READY_FOR_PICKUP') { <span class="muted">En attente d’un livreur</span> }</div></article>
          } }
        </section>
      }
      <a class="back" routerLink="/restaurants">← Voir les restaurants</a>
    </section>
  `,
  styles: [`
    :host { display:block; min-height:calc(100vh - 78px); background:#fffefa; color:#283028; }.manage-page { max-width:1050px; margin:auto; padding:45px 24px 75px; }.page-heading { margin-bottom:24px; }.page-heading>p,.eyebrow { margin:0 0 7px; color:#d96949; font-size:9px; font-weight:850; letter-spacing:1.4px; }.page-heading h1 { margin:0 0 7px; font:800 31px Manrope,sans-serif; letter-spacing:-.7px; }.page-heading>span { color:#85867e; font-size:12px; }.panel,.state-card,.notice { border:1px solid #eeeae2; border-radius:11px; background:white; padding:20px; box-shadow:0 8px 20px #3d38240b; }.state-card { text-align:center; padding:42px 20px; color:#74776d; font-size:12px; }.state-card h2 { color:#283028; font:750 19px Manrope,sans-serif; }.state-card a { color:#c45b3f; font-weight:750; }.state-icon { color:#d96949; font-size:26px; }.create-form { max-width:650px; }.create-form h2,.section-heading h2 { margin:0 0 6px; font:750 18px Manrope,sans-serif; }.create-form>p,.muted { color:#85867e; font-size:11px; }.create-form label { display:block; margin:13px 0 6px; color:#555a51; font-size:10px; font-weight:750; }.create-form input,.create-form textarea,.add-product input,.add-category input { width:100%; box-sizing:border-box; padding:10px; border:1px solid #e6e3da; border-radius:7px; font:12px inherit; font-family:inherit; }.create-form textarea { resize:vertical; }.two-fields { display:grid; grid-template-columns:1fr 1fr; gap:13px; }.two-fields>div { min-width:0; }.primary,.secondary { border:0; border-radius:7px; padding:10px 13px; font-size:10px; font-weight:750; cursor:pointer; }.primary { background:#29352b; color:white; }.secondary { background:#f4f0e7; color:#394137; }.primary:disabled,.secondary:disabled { opacity:.5; }.create-form>.primary { margin-top:17px; }.restaurant-heading { display:flex; justify-content:space-between; align-items:center; gap:15px; margin-bottom:13px; }.restaurant-heading h2 { margin:4px 0; font:800 22px Manrope,sans-serif; }.restaurant-heading p { margin:0; color:#85867e; font-size:11px; }.notice { margin-bottom:13px; }.error { color:#ac3b30; }.menu-panel,.orders-panel { margin-top:13px; }.section-heading { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }.section-heading .eyebrow { display:block; }.category-card { padding:13px 0; border-top:1px solid #f0eee8; }.category-heading { display:flex; align-items:center; justify-content:space-between; gap:10px; }.category-heading h3 { margin:0 0 10px; font:700 14px Manrope,sans-serif; }.text-danger,.link-button { border:0; background:transparent; color:#b8563d; font-size:10px; cursor:pointer; }.product-row { display:grid; grid-template-columns:minmax(0,1fr) auto auto auto; align-items:center; gap:14px; padding:9px 0; border-top:1px solid #f7f5f0; }.product-row>div { display:grid; gap:3px; }.product-row strong { font-size:11px; }.product-row small { color:#929288; font-size:9px; }.product-row>span { font-size:11px; font-weight:700; }.availability { border:0; border-radius:20px; padding:5px 8px; background:#edf4ea; color:#55764e; font-size:9px; cursor:pointer; }.availability.off { background:#fff0ed; color:#a24b3b; }.add-product,.add-category { display:flex; gap:8px; margin-top:10px; }.add-product input:first-child,.add-category input { flex:1; }.add-product input:nth-child(2) { max-width:115px; }.order-row { padding:14px 0; border-top:1px solid #f0eee8; }.order-title,.order-action { display:flex; justify-content:space-between; align-items:center; gap:10px; }.order-title strong { font-size:12px; }.order-title span,.order-row p { color:#7c7f75; font-size:10px; }.order-row p { margin:6px 0; }.order-status { color:#966a26; background:#fff2db; border-radius:20px; padding:5px 8px; font-size:9px; font-weight:750; }.back { display:block; margin-top:19px; color:#c15b40; font-size:11px; text-align:center; text-decoration:none; }.link-button { font-weight:750; }
    @media(max-width:650px) { .manage-page { padding:32px 16px 55px; }.page-heading h1 { font-size:26px; }.panel { padding:15px; }.restaurant-heading { align-items:flex-start; flex-direction:column; }.two-fields { grid-template-columns:1fr; gap:0; }.product-row { grid-template-columns:minmax(0,1fr) auto auto; gap:8px; }.product-row .text-danger { grid-column:3; grid-row:1; }.product-row>span { grid-column:2; grid-row:1; }.add-product { flex-wrap:wrap; }.add-product input:first-child { min-width:100%; }.add-product input:nth-child(2) { max-width:none; flex:1; }.order-action { align-items:flex-start; flex-direction:column; } }
  `]
})
export class RestaurantManagementComponent implements OnInit {
  private auth = inject(AuthService);
  private restaurantService = inject(RestaurantService);
  private applicationService = inject(ProfessionalApplicationService);
  private orderService = inject(OrderService);
  restaurant = signal<Restaurant | null>(null);
  orders = signal<Order[]>([]);
  loading = signal(true);
  ordersLoading = signal(false);
  approved = signal(false);
  busy = signal(false);
  error = signal('');
  name = '';
  description = '';
  address = '';
  phone = '';
  categoryName = '';
  productNames: Record<string, string> = {};
  productPrices: Record<string, number | null> = {};

  ngOnInit(): void {
    if (!this.auth.token()) { void this.auth.login('/restaurant/manage'); return; }
    this.applicationService.mine().subscribe({
      next: rows => {
        const approval = rows.find(row => row.applicationType === 'RESTAURANT' && row.status === 'APPROVED');
        this.approved.set(!!approval);
        if (approval) { this.name = approval.name; this.address = approval.address || ''; this.phone = approval.phone; this.description = approval.details || ''; this.loadRestaurant(); }
        else this.loading.set(false);
      },
      error: () => { this.error.set('Impossible de vérifier le statut de votre demande.'); this.loading.set(false); }
    });
  }

  createRestaurant(): void {
    this.error.set(''); this.busy.set(true);
    this.restaurantService.createRestaurant({ name: this.name.trim(), description: this.description.trim(), address: this.address.trim(), phone: this.phone.trim() }).subscribe({
      next: restaurant => { this.busy.set(false); this.openRestaurant(restaurant.id); },
      error: response => { this.error.set(response.status === 403 ? 'Votre demande doit être approuvée avant de créer votre fiche.' : 'La fiche n’a pas pu être créée. Vérifiez les informations puis réessayez.'); this.busy.set(false); }
    });
  }

  toggleOpen(): void {
    const current = this.restaurant(); if (!current) return;
    this.busy.set(true);
    this.restaurantService.updateRestaurant(current.id, { status: current.status === 'OPEN' ? 'CLOSED' : 'OPEN' }).subscribe({
      next: () => { this.busy.set(false); this.openRestaurant(current.id); },
      error: () => { this.error.set('Le statut du restaurant n’a pas pu être modifié.'); this.busy.set(false); }
    });
  }

  addCategory(): void {
    const current = this.restaurant(); if (!current || !this.categoryName.trim()) return;
    this.busy.set(true);
    this.restaurantService.createCategory({ name: this.categoryName.trim(), restaurantId: current.id }).subscribe({
      next: () => { this.categoryName = ''; this.busy.set(false); this.openRestaurant(current.id); },
      error: () => { this.error.set('Impossible d’ajouter cette catégorie.'); this.busy.set(false); }
    });
  }

  addProduct(categoryId: string): void {
    const name = this.productNames[categoryId]?.trim(); const price = Number(this.productPrices[categoryId]);
    const current = this.restaurant(); if (!name || !Number.isFinite(price) || price <= 0 || !current) return;
    this.busy.set(true);
    this.restaurantService.createProduct({ name, description: '', price, categoryId }).subscribe({
      next: () => { delete this.productNames[categoryId]; delete this.productPrices[categoryId]; this.busy.set(false); this.openRestaurant(current.id); },
      error: () => { this.error.set('Impossible d’ajouter ce plat. Vérifiez son prix.'); this.busy.set(false); }
    });
  }

  toggleProduct(id: string, available: boolean): void {
    const current = this.restaurant(); if (!current) return;
    this.restaurantService.updateProduct(id, { available: !available }).subscribe({ next: () => this.openRestaurant(current.id), error: () => this.error.set('Impossible de modifier la disponibilité du plat.') });
  }

  deleteProduct(id: string): void {
    const current = this.restaurant(); if (!current) return;
    this.restaurantService.deleteProduct(id).subscribe({ next: () => this.openRestaurant(current.id), error: () => this.error.set('Impossible de supprimer ce plat.') });
  }

  deleteCategory(id: string): void {
    const current = this.restaurant(); if (!current) return;
    this.restaurantService.deleteCategory(id).subscribe({ next: () => this.openRestaurant(current.id), error: () => this.error.set('Impossible de supprimer cette catégorie.') });
  }

  loadOrders(): void {
    const current = this.restaurant(); if (!current) return;
    this.ordersLoading.set(true);
    this.orderService.getOrdersByRestaurant(current.id).subscribe({ next: rows => { this.orders.set(rows); this.ordersLoading.set(false); }, error: () => { this.ordersLoading.set(false); this.error.set('Impossible de charger les commandes.'); } });
  }

  nextStatus(status: Order['status']): Order['status'] | null {
    if (status === 'CREATED') return 'PREPARING';
    if (status === 'PREPARING') return 'READY_FOR_PICKUP';
    return null;
  }

  advanceOrder(order: Order, status: Order['status']): void {
    this.busy.set(true);
    this.orderService.updateStatus(order.id, status).subscribe({
      next: updated => { this.orders.update(rows => rows.map(row => row.id === updated.id ? updated : row)); this.busy.set(false); },
      error: () => { this.error.set('Impossible de mettre à jour la commande.'); this.busy.set(false); }
    });
  }

  orderStatus(status: Order['status']): string {
    return { CREATED: 'Reçue', PENDING_PAYMENT: 'Paiement en attente', PAID: 'Payée', PREPARING: 'En préparation', READY_FOR_PICKUP: 'Prête, en attente d’un livreur', IN_DELIVERY: 'En livraison', DELIVERED: 'Livrée', CANCELLED: 'Annulée' }[status];
  }

  private loadRestaurant(): void {
    this.restaurantService.getMyRestaurants().subscribe({
      next: rows => { this.loading.set(false); if (rows[0]) this.openRestaurant(rows[0].id); else this.restaurant.set(null); },
      error: () => { this.error.set('Impossible de charger votre fiche restaurant.'); this.loading.set(false); }
    });
  }

  private openRestaurant(id: string): void {
    this.restaurantService.getRestaurantById(id).subscribe({
      next: restaurant => { this.restaurant.set(restaurant); this.loadOrders(); },
      error: () => { this.error.set('Impossible de charger le menu du restaurant.'); }
    });
  }
}
