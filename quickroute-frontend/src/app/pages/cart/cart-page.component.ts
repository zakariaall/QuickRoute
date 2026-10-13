import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../models/restaurant.model';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="cart-page">
      <header class="page-heading">
        <p>VOTRE SÉLECTION</p>
        <h1>Votre panier</h1>
        <span>Vérifiez votre commande avant de la confirmer.</span>
      </header>

      @if (cart.items().length === 0) {
        <section class="empty-cart">
          <span class="empty-icon">♧</span>
          <h2>Votre panier est vide</h2>
          <p>Choisissez un restaurant et ajoutez quelques plats.</p>
          <a routerLink="/restaurants">Découvrir les restaurants</a>
        </section>
      } @else {
        <div class="cart-layout">
          <section class="items-card" aria-label="Articles du panier">
            @for (item of cart.items(); track item.product.id) {
              <article class="cart-item">
                <div class="item-copy">
                  <h2>{{ item.product.name }}</h2>
                  <p>{{ item.product.description }}</p>
                  <strong>{{ item.product.price | currency:'MAD':'symbol-narrow':'1.2-2':'fr-MA' }}</strong>
                </div>
                <div class="item-actions">
                  <div class="quantity" [attr.aria-label]="'Quantité : ' + item.quantity">
                    <button type="button" [attr.aria-label]="'Retirer une unité de ' + item.product.name" (click)="cart.decreaseQuantity(item.product.id)">−</button>
                    <span>{{ item.quantity }}</span>
                    <button type="button" [attr.aria-label]="'Ajouter une unité de ' + item.product.name" (click)="increase(item.product)">+</button>
                  </div>
                  <strong>{{ item.product.price * item.quantity | currency:'MAD':'symbol-narrow':'1.2-2':'fr-MA' }}</strong>
                  <button class="remove" type="button" (click)="cart.removeFromCart(item.product.id)">Retirer</button>
                </div>
              </article>
            }
            <button class="clear-cart" type="button" (click)="cart.clearCart()">Vider le panier</button>
          </section>

          <aside class="summary-card">
            <h2>Livraison</h2>
            <label for="delivery-address">Adresse à Casablanca</label>
            <textarea id="delivery-address" name="deliveryAddress" [(ngModel)]="deliveryAddress" rows="3" placeholder="Quartier, rue et numéro"></textarea>
            <p class="hint">Le paiement en ligne n’est pas encore disponible.</p>
            @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
            <div class="summary-total"><span>{{ cart.totalCount() }} article(s)</span><strong>{{ cart.totalAmount() | currency:'MAD':'symbol-narrow':'1.2-2':'fr-MA' }}</strong></div>
            <button class="submit-order" type="button" [disabled]="isSubmitting() || !deliveryAddress.trim()" (click)="placeOrder()">
              {{ isSubmitting() ? 'Envoi de la commande…' : 'Confirmer la commande' }}
            </button>
            <a class="continue" routerLink="/restaurants">Continuer mes achats</a>
          </aside>
        </div>
      }
    </section>
  `,
  styles: [`
    :host { display:block; min-height:calc(100vh - 78px); background:#fffefa; color:#283028; }
    .cart-page { max-width:1100px; margin:auto; padding:54px 28px 80px; }
    .page-heading { margin-bottom:28px; }.page-heading p { margin:0 0 9px; color:#df6b4a; font-size:10px; font-weight:800; letter-spacing:1.5px; }
    .page-heading h1 { margin:0 0 8px; font:800 34px Manrope,sans-serif; letter-spacing:-1px; }.page-heading span { color:#85867e; font-size:13px; }
    .cart-layout { display:grid; grid-template-columns:minmax(0,1fr) 330px; gap:22px; align-items:start; }
    .items-card,.summary-card,.empty-cart { background:white; border:1px solid #eeeae2; border-radius:13px; box-shadow:0 8px 20px #3d38240b; }
    .items-card { padding:8px 20px 18px; }.cart-item { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:20px 0; border-bottom:1px solid #f0eee8; }
    .item-copy h2 { margin:0 0 5px; font:700 15px Manrope,sans-serif; }.item-copy p { margin:0 0 8px; color:#898a82; font-size:12px; }.item-copy>strong { font-size:12px; }
    .item-actions { display:flex; align-items:center; gap:15px; }.item-actions>strong { min-width:90px; text-align:right; font-size:13px; }.quantity { display:flex; align-items:center; gap:10px; border:1px solid #ebe8e0; border-radius:7px; padding:3px; }.quantity button { width:27px; height:27px; border:0; border-radius:5px; background:#f5f1e8; color:#283028; font-size:17px; cursor:pointer; }.quantity span { min-width:15px; text-align:center; font-size:12px; }
    .remove,.clear-cart { border:0; background:transparent; color:#bd624a; font-size:11px; cursor:pointer; }.clear-cart { margin-top:16px; padding:5px 0; }
    .summary-card { padding:22px; position:sticky; top:96px; }.summary-card h2 { margin:0 0 18px; font:750 17px Manrope,sans-serif; }.summary-card label { display:block; margin-bottom:7px; color:#62665d; font-size:11px; font-weight:700; }.summary-card textarea { width:100%; box-sizing:border-box; resize:vertical; border:1px solid #e6e3da; border-radius:7px; padding:10px; font:12px inherit; }.hint { color:#8a8a81; font-size:10px; line-height:1.5; margin:9px 0 17px; }.error { color:#ad3f31; font-size:11px; line-height:1.4; }.summary-total { display:flex; justify-content:space-between; align-items:center; padding:16px 0; border-top:1px solid #eeece6; font-size:12px; }.summary-total strong { font-size:15px; }
    .submit-order { width:100%; border:0; border-radius:7px; padding:13px; background:#29352b; color:#fff; font-size:12px; font-weight:750; cursor:pointer; }.submit-order:disabled { opacity:.48; cursor:not-allowed; }.continue { display:block; margin-top:13px; color:#6f736b; font-size:11px; text-align:center; text-decoration:none; }
    .empty-cart { padding:50px 20px; text-align:center; }.empty-icon { color:#e16b4b; font-size:32px; }.empty-cart h2 { margin:12px 0 6px; font:750 20px Manrope,sans-serif; }.empty-cart p { color:#85867e; font-size:12px; margin-bottom:18px; }.empty-cart a { color:#d65f40; font-size:12px; font-weight:750; text-decoration:none; }
    @media(max-width:760px) { .cart-page { padding:35px 18px 55px; }.cart-layout { grid-template-columns:1fr; }.summary-card { position:static; }.cart-item { align-items:flex-start; flex-direction:column; }.item-actions { width:100%; justify-content:space-between; gap:8px; }.item-actions>strong { min-width:auto; }.page-heading h1 { font-size:29px; } }
  `]
})
export class CartPageComponent {
  cart = inject(CartService);
  private auth = inject(AuthService);
  private orders = inject(OrderService);
  private router = inject(Router);
  deliveryAddress = '';
  isSubmitting = signal(false);
  error = signal('');

  increase(product: Product): void {
    const restaurantId = this.cart.currentRestaurantId();
    if (restaurantId) this.cart.addToCart(product, restaurantId);
  }

  placeOrder(): void {
    const restaurantId = this.cart.currentRestaurantId();
    const items = this.cart.items();
    if (!restaurantId || !items.length || !this.deliveryAddress.trim()) return;
    if (!this.auth.token()) { void this.auth.login('/cart'); return; }

    this.error.set('');
    this.isSubmitting.set(true);
    this.orders.createOrder({
      restaurantId,
      deliveryAddress: this.deliveryAddress.trim(),
      items: items.map(({ product, quantity }) => ({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity
      }))
    }).subscribe({
      next: order => {
        this.cart.clearCart();
        this.isSubmitting.set(false);
        void this.router.navigate(['/orders', order.id, 'tracking']);
      },
      error: () => {
        this.error.set('La commande n’a pas pu être envoyée. Réessayez dans un instant.');
        this.isSubmitting.set(false);
      }
    });
  }
}
