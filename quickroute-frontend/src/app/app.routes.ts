import { Routes } from '@angular/router';
import { RestaurantListComponent } from './pages/restaurant-list/restaurant-list.component';
import { RestaurantDetailComponent } from './pages/restaurant-detail/restaurant-detail.component';
import { OrderTrackingComponent } from './pages/order-tracking/order-tracking.component';
import { CartPageComponent } from './pages/cart/cart-page.component';
import { OrderHistoryComponent } from './pages/orders/order-history.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminApplicationsComponent } from './pages/admin-applications/admin-applications.component';
import { RestaurantManagementComponent } from './pages/restaurant-management/restaurant-management.component';
import { DriverDeliveriesComponent } from './pages/driver-deliveries/driver-deliveries.component';

export const routes: Routes = [
  { path: '', redirectTo: 'restaurants', pathMatch: 'full' },
  { path: 'restaurants', component: RestaurantListComponent },
  { path: 'restaurants/:id', component: RestaurantDetailComponent },
  { path: 'cart', component: CartPageComponent },
  { path: 'orders', component: OrderHistoryComponent },
  { path: 'orders/:id/tracking', component: OrderTrackingComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin/applications', component: AdminApplicationsComponent },
  { path: 'restaurant/manage', component: RestaurantManagementComponent },
  { path: 'driver/deliveries', component: DriverDeliveriesComponent },
  { path: '**', redirectTo: 'restaurants' }
];
