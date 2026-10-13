import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/restaurant.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  currentRestaurantId = signal<string | null>(sessionStorage.getItem('quickroute_cart_restaurant'));
  items = signal<CartItem[]>(this.restoreCart());

  totalCount = computed(() =>
    this.items().reduce((acc, item) => acc + item.quantity, 0)
  );

  totalAmount = computed(() =>
    this.items().reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  );

  addToCart(product: Product, restaurantId: string): boolean {
    // Règle métier : Panier mono-restaurant
    if (this.currentRestaurantId() && this.currentRestaurantId() !== restaurantId && this.items().length > 0) {
      const confirmReset = confirm("Votre panier contient déjà des articles d'un autre restaurant. Voulez-vous le vider pour commander ici ?");
      if (!confirmReset) return false;
      this.clearCart();
    }

    this.currentRestaurantId.set(restaurantId);
    const existing = this.items().find(i => i.product.id === product.id);

    if (existing) {
      this.items.update(list =>
        list.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      );
    } else {
      this.items.update(list => [...list, { product, quantity: 1 }]);
    }
    this.persistCart();
    return true;
  }

  decreaseQuantity(productId: string): void {
    const item = this.items().find(entry => entry.product.id === productId);
    if (!item) return;
    if (item.quantity <= 1) {
      this.removeFromCart(productId);
      return;
    }
    this.items.update(list => list.map(entry => entry.product.id === productId
      ? { ...entry, quantity: entry.quantity - 1 }
      : entry));
    this.persistCart();
  }

  removeFromCart(productId: string) {
    this.items.update(list => list.filter(i => i.product.id !== productId));
    if (this.items().length === 0) {
      this.currentRestaurantId.set(null);
    }
    this.persistCart();
  }

  clearCart() {
    this.items.set([]);
    this.currentRestaurantId.set(null);
    sessionStorage.removeItem('quickroute_cart');
    sessionStorage.removeItem('quickroute_cart_restaurant');
  }

  private restoreCart(): CartItem[] {
    try {
      const parsed = JSON.parse(sessionStorage.getItem('quickroute_cart') || '[]') as CartItem[];
      return Array.isArray(parsed) ? parsed.filter(item => item?.product?.id && item.quantity > 0) : [];
    } catch { return []; }
  }

  private persistCart(): void {
    sessionStorage.setItem('quickroute_cart', JSON.stringify(this.items()));
    const restaurant = this.currentRestaurantId();
    if (restaurant) sessionStorage.setItem('quickroute_cart_restaurant', restaurant);
    else sessionStorage.removeItem('quickroute_cart_restaurant');
  }
}
