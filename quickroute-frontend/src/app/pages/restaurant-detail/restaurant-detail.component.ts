import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../services/restaurant.service';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Restaurant, Product } from '../../models/restaurant.model';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      @if (restaurant(); as resto) {
        <div class="resto-header">
          <h2>{{ resto.name }}</h2>
          <p class="meta">📍 {{ resto.address }} | 📞 {{ resto.phone }}</p>
          <p class="desc">{{ resto.description }}</p>
        </div>

        <div class="main-layout">
          <div class="menu-section">
            <h3>Menu & Plats</h3>
            @if (!resto.categories || resto.categories.length === 0) {
              <p class="empty-msg">Aucun plat enregistré pour ce restaurant.</p>
            }
            @for (cat of resto.categories; track cat.id) {
              <div class="category-block">
                <h4>{{ cat.name }}</h4>
                <div class="product-grid">
                  @for (prod of cat.products; track prod.id) {
                    <div class="product-card">
                      <div class="prod-info">
                        <h5>{{ prod.name }}</h5>
                        <p>{{ prod.description }}</p>
                        <span class="price">{{ prod.price | currency:'MAD':'symbol-narrow':'1.2-2':'fr-MA' }}</span>
                      </div>
                      <button class="btn-add" (click)="addToCart(prod, resto.id)" [disabled]="!prod.available">
                        {{ prod.available ? '+ Ajouter' : 'Épuisé' }}
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Panier latéral -->
          <div class="cart-sidebar">
            <h3>Votre Panier</h3>
            @if (cart.items().length === 0) {
              <p class="empty-cart">Votre panier est vide.</p>
            } @else {
              <div class="cart-items">
                @for (item of cart.items(); track item.product.id) {
                  <div class="cart-line">
                    <div>
                      <strong>{{ item.quantity }}x</strong> {{ item.product.name }}
                    </div>
                    <div>
                      <span>{{ (item.product.price * item.quantity) | currency:'MAD':'symbol-narrow':'1.2-2':'fr-MA' }}</span>
                      <button class="btn-del" (click)="cart.removeFromCart(item.product.id)">×</button>
                    </div>
                  </div>
                }
              </div>

              <div class="cart-total">
                <span>Total :</span>
                <strong>{{ cart.totalAmount() | currency:'MAD':'symbol-narrow':'1.2-2':'fr-MA' }}</strong>
              </div>

              <div class="checkout-box">
                <label>Adresse de livraison :</label>
                <input type="text" [(ngModel)]="deliveryAddress" placeholder="Quartier, rue et numéro à Casablanca" />
                <button class="btn-order" (click)="checkout(resto.id)" [disabled]="isSubmitting() || !deliveryAddress.trim()">
                  {{ isSubmitting() ? 'Commande en cours...' : 'Passer la commande' }}
                </button>
              </div>
            }
          </div>
        </div>
      } @else if (loading()) {
        <div class="empty-msg" role="status">Chargement du menu…</div>
      } @else {
        <div class="empty-msg" role="alert">Impossible de charger ce restaurant. <a routerLink="/restaurants">Retour aux restaurants</a></div>
      }
    </div>
  `,
  styles: [`
    .container { max-width: 1180px; margin: 0 auto; padding: 2.5rem 1.5rem; font-family: 'DM Sans', sans-serif; }
    .resto-header { background: #f5f1e8; border: 1px solid #eee8db; border-radius: 14px; padding: 1.6rem 1.8rem; margin-bottom: 1.5rem; }
    .resto-header h2 { font: 800 2rem Manrope, sans-serif; letter-spacing: -1px; color: #283028; margin: 0 0 0.6rem; }
    .meta { color: #77796f; margin: 0 0 0.5rem; font-size: 0.85rem; }
    .desc { color: #555c52; font-size: .95rem; margin-bottom: 0; }
    .main-layout { display: grid; grid-template-columns: minmax(0,1fr) 340px; gap: 1.5rem; align-items: start; }
    .menu-section { background: white; border: 1px solid #eeeae2; border-radius: 14px; padding: 1.4rem; }
    .menu-section>h3 { font: 750 1.35rem Manrope,sans-serif; margin: 0 0 1.2rem; }
    .category-block { margin-bottom: 1.7rem; }
    .category-block h4 { font: 700 1.08rem Manrope,sans-serif; color: #354035; border-bottom: 1px solid #eeeae2; padding-bottom: 0.65rem; }
    .product-grid { display: flex; flex-direction: column; gap: 1rem; }
    .product-card { display: flex; justify-content: space-between; align-items: center; border: 1px solid #eeeae2; border-radius: 10px; padding: 1rem; background: #fffefa; gap: 1rem; }
    .prod-info h5 { margin: 0 0 0.25rem 0; font-size: 1.05rem; }
    .prod-info p { margin: 0 0 0.5rem; color: #85867e; font-size: 0.82rem; }
    .price { font-weight: 800; color: #30382f; }
    .btn-add { background: #f15e3b; color: white; border: none; padding: 0.65rem 0.9rem; border-radius: 7px; cursor: pointer; font-weight: 700; white-space: nowrap; }
    .btn-add:disabled { background: #cfcfc7; cursor: not-allowed; }
    .cart-sidebar { background: white; border: 1px solid #eeeae2; border-radius: 14px; padding: 1.4rem; height: fit-content; position: sticky; top: 96px; box-shadow: 0 8px 20px #3d38240b; }
    .cart-sidebar h3 { margin: 0 0 1.1rem; font: 750 1.2rem Manrope,sans-serif; }
    .cart-line { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.95rem; }
    .btn-del { background: none; border: none; color: #ef4444; font-size: 1.2rem; cursor: pointer; margin-left: 0.5rem; }
    .cart-total { display: flex; justify-content: space-between; border-top: 1px solid #eeeae2; padding-top: 1rem; margin-top: 1rem; font-size: 1.05rem; }
    .checkout-box { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .checkout-box input { padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; }
    .btn-order { background: #29352b; color: white; border: none; padding: 0.8rem; border-radius: 8px; font-weight: 750; cursor: pointer; margin-top: 0.5rem; }
    .btn-order:disabled { background: #94a3b8; cursor: not-allowed; }
    @media(max-width:760px) { .main-layout { grid-template-columns: 1fr; }.cart-sidebar { position: static; }.container { padding: 1.4rem 1rem; }.resto-header { padding: 1.2rem; }.product-card { align-items:flex-start; }.btn-add { align-self:center; } }
  `]
})
export class RestaurantDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private restaurantService = inject(RestaurantService);
  private orderService = inject(OrderService);
  private auth = inject(AuthService);
  cart = inject(CartService);

  restaurant = signal<Restaurant | null>(null);
  loading = signal(true);
  deliveryAddress: string = '';
  isSubmitting = signal<boolean>(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.restaurantService.getRestaurantById(id).subscribe(resto => {
        this.restaurant.set(resto);
        this.loading.set(false);
      }, () => this.loading.set(false));
    } else {
      this.loading.set(false);
    }
  }

  addToCart(prod: Product, restoId: string) {
    this.cart.addToCart(prod, restoId);
  }

  checkout(restoId: string) {
    if (!this.deliveryAddress.trim() || this.cart.items().length === 0) return;
    if (!this.auth.token()) { void this.auth.login(this.router.url); return; }

    this.isSubmitting.set(true);
    const orderPayload = {
      restaurantId: restoId,
      deliveryAddress: this.deliveryAddress,
      items: this.cart.items().map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        price: i.product.price,
        quantity: i.quantity
      }))
    };

    this.orderService.createOrder(orderPayload).subscribe({
      next: (order) => {
        this.cart.clearCart();
        this.isSubmitting.set(false);
        this.router.navigate(['/orders', order.id, 'tracking']);
      },
      error: (err) => {
        alert('Erreur lors de la commande : ' + (err.error?.error || err.message));
        this.isSubmitting.set(false);
      }
    });
  }
}
