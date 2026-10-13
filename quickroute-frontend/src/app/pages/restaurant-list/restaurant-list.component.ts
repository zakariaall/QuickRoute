import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../models/restaurant.model';

type RestaurantCard = Restaurant & { cuisine: string; image: string };

@Component({
  selector: 'app-restaurant-list', standalone: true, imports: [CommonModule, RouterLink],
  template: `
    <section class="hero"><div class="hero-inner">
      <div class="hero-copy"><div class="eyebrow"><span class="spark">✳</span> BONNES ADRESSES, BONNE HUMEUR</div>
        <h1>Les bonnes choses<br>arrivent <em>chez vous.</em></h1>
        <p>Les tables qu’on aime à Casablanca, livrées à votre porte.</p>
        <label class="search-box"><span>⌕</span><input [value]="query()" (input)="query.set($any($event.target).value)" placeholder="Un plat, une envie, un restaurant…"><button type="button" (click)="focusRestaurants()">Explorer <b>→</b></button></label>
        <div class="hero-note"><span class="green-dot"></span> De bonnes adresses près de vous <i>·</i> Casablanca</div>
      </div><div class="hero-art"><div class="art-blob"></div><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85" alt="Un plat marocain généreux"><div class="floating-note"><span>✦</span><div><b>Un peu de soleil</b><small>dans votre assiette</small></div></div><div class="hero-stamp">BON<br>APPÉTIT <span>✳</span></div></div>
    </div></section>
    <section class="browse" id="restaurants"><div class="browse-head"><div><div class="section-kicker">À TABLE, CASABLANCA</div><h2>Qu’est-ce qui vous ferait plaisir ?</h2><p>Une petite sélection pour bien commencer.</p></div><div class="result-count">{{ filtered().length }} adresses</div></div>
      <div class="filters"><button [class.selected]="selectedCuisine() === 'Tout'" (click)="select('Tout')"><span>✳</span> Tout voir</button><button [class.selected]="selectedCuisine() === 'Marocain'" (click)="select('Marocain')">◉ Marocain</button><button [class.selected]="selectedCuisine() === 'Burger'" (click)="select('Burger')">▣ Burgers</button><button [class.selected]="selectedCuisine() === 'Italien'" (click)="select('Italien')">◌ Italien</button><button [class.selected]="selectedCuisine() === 'Frais'" (click)="select('Frais')">✳ Frais & léger</button><span class="open-label"><span class="green-dot"></span> Ouvert maintenant</span></div>
      @if (loading()) { <div class="loading">Chargement des restaurants…</div> }
      @if (error()) { <div class="empty" role="alert">Impossible de charger les restaurants. Vérifiez la connexion puis réessayez. <button type="button" (click)="loadRestaurants()">Réessayer</button></div> }
      <div class="restaurant-grid">
        @for (place of filtered(); track place.id) { <a class="restaurant-card" [routerLink]="['/restaurants', place.id]">
          <div class="photo-wrap"><img [src]="place.image" [alt]="'Cuisine de ' + place.name" loading="lazy"><span class="photo-tag">À découvrir</span><button class="heart" type="button" [attr.aria-label]="isFavorite(place.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'" [attr.aria-pressed]="isFavorite(place.id)" (click)="$event.preventDefault(); $event.stopPropagation(); toggleFavorite(place.id)">{{ isFavorite(place.id) ? '♥' : '♡' }}</button></div>
          <div class="card-content"><div class="card-title"><h3>{{ place.name }}</h3><span class="open-status" [class.closed-status]="place.status !== 'OPEN'"><i></i> {{ place.status === 'OPEN' ? 'Ouvert' : 'Fermé' }}</span></div><p>{{ place.cuisine }}</p><p class="card-description">{{ place.description }}</p><div class="card-foot"><span>⌖ {{ place.address }}</span><b>Voir le menu <i>↗</i></b></div></div>
        </a> }
      </div>
      @if (!loading() && !error() && filtered().length === 0) { <div class="empty">Aucune adresse dans cette sélection. Essayez une autre envie.</div> }
    </section>
  `,
  styles: [`
    :host { display:block; background:#fffefa; min-height:calc(100vh - 78px); color:#283028; }
    .hero { background:#f5f1e8; overflow:hidden; }.hero-inner { max-width:1240px; min-height:415px; padding:57px 28px 48px; margin:auto; display:grid; grid-template-columns:1.04fr .96fr; align-items:center; }
    .eyebrow,.section-kicker { font-size:10px; letter-spacing:1.7px; font-weight:800; color:#777a6c; }.spark { color:#f15e3b; margin-right:7px; font-size:15px; }
    h1 { margin:19px 0 13px; font:800 clamp(40px,5.1vw,62px)/1.06 Manrope,sans-serif; letter-spacing:-3px; color:#273128; } h1 em { color:#ed6848; font-style:normal; }.hero-copy>p { font-size:14px; color:#73766d; margin:0 0 24px; }
    .search-box { width:min(490px,100%); height:57px; padding:6px 7px 6px 17px; background:white; border:1px solid #e8e4da; border-radius:11px; display:flex; align-items:center; gap:10px; box-shadow:0 8px 20px #43442e0b; }.search-box>span { font-size:24px; color:#98988f; }.search-box input { flex:1; min-width:0; border:0; outline:0; font-size:12px; color:#30392f; }.search-box input::placeholder { color:#aaa99f; }.search-box button { border:0; border-radius:7px; background:#f15e3b; color:white; padding:12px 14px; font-size:11px; font-weight:750; cursor:pointer; }.search-box button b { margin-left:12px; }.hero-note { display:flex; align-items:center; gap:8px; margin-top:16px; font-size:10px; color:#77796f; }.hero-note i { color:#cbc6ba; font-style:normal; }
    .green-dot { width:7px; height:7px; border-radius:50%; background:#6c9a64; display:inline-block; box-shadow:0 0 0 3px #6c9a6418; }.hero-art { height:320px; position:relative; display:grid; place-items:center; }.hero-art>img { position:relative; z-index:1; width:min(355px,75%); height:280px; object-fit:cover; border-radius:48% 48% 44% 44%; transform:rotate(4deg); box-shadow:0 20px 48px #40351c29; }.art-blob { position:absolute; background:#e8bd73; width:340px; height:280px; border-radius:47% 53% 48% 52%; transform:rotate(-12deg); }.floating-note { position:absolute; z-index:2; left:7%; bottom:23px; background:white; padding:12px 16px; border-radius:12px; box-shadow:0 8px 25px #38331d18; display:flex; align-items:center; gap:10px; }.floating-note>span { color:#ec7749; font-size:22px; }.floating-note div { display:grid; gap:3px; }.floating-note b { font-size:11px; }.floating-note small { color:#96958a; font-size:9px; }.hero-stamp { position:absolute; right:4%; top:21px; z-index:2; width:73px; height:73px; border:1px solid #f15e3b; border-radius:50%; color:#e75d3a; display:grid; place-content:center; text-align:center; font-size:9px; line-height:1.3; font-weight:800; transform:rotate(12deg); }.hero-stamp span { font-size:14px; }
    .browse { max-width:1240px; margin:auto; padding:48px 28px 76px; }.browse-head { display:flex; align-items:end; justify-content:space-between; }.section-kicker { color:#e36a49; font-size:9px; }.browse h2 { font:750 27px Manrope,sans-serif; letter-spacing:-.8px; margin:8px 0 5px; }.browse-head p { font-size:12px; color:#929188; margin:0; }.result-count { font-size:11px; color:#909087; padding-bottom:5px; }
    .filters { display:flex; align-items:center; gap:9px; border-bottom:1px solid #efede6; padding:23px 0 18px; margin-bottom:20px; flex-wrap:wrap; }.filters button { border:1px solid #eae7df; color:#6f726c; background:white; border-radius:8px; padding:9px 13px; font-size:10px; font-weight:650; cursor:pointer; }.filters button.selected { background:#29352b; color:white; border-color:#29352b; }.filters button span { color:#ef7752; }.open-label { margin-left:auto; color:#888980; display:flex; gap:8px; align-items:center; font-size:10px; }
    .restaurant-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:20px; }.restaurant-card { text-decoration:none; color:inherit; background:#fff; border:1px solid #eeeae2; border-radius:12px; overflow:hidden; transition:transform .2s,box-shadow .2s; }.restaurant-card:hover { transform:translateY(-4px); box-shadow:0 13px 30px #3d382413; }.photo-wrap { height:180px; position:relative; overflow:hidden; background:#f1eee5; }.photo-wrap>img { width:100%; height:100%; object-fit:cover; transition:transform .35s; }.restaurant-card:hover .photo-wrap>img { transform:scale(1.04); }.photo-tag { position:absolute; left:12px; top:12px; color:#4f5147; background:#fffef2ed; padding:7px 9px; border-radius:5px; font-size:9px; font-weight:750; }.heart { position:absolute; top:11px; right:11px; border:0; width:29px; height:29px; border-radius:50%; background:#fff; color:#554f48; font-size:17px; cursor:pointer; }.card-content { padding:15px 15px 13px; }.card-title { display:flex; align-items:center; justify-content:space-between; gap:5px; }.card-title h3 { font:750 16px Manrope,sans-serif; margin:0; letter-spacing:-.3px; }.open-status { color:#608459; font-size:9px; font-weight:700; display:flex; gap:6px; align-items:center; }.open-status i { width:6px;height:6px;background:#6c9a64;border-radius:50%; }.card-content>p { font-size:10px; color:#dc7252; font-weight:700; margin:7px 0; }.card-content>p.card-description { color:#8a8a81; font-weight:400; font-size:10px; margin:0 0 13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }.card-foot { display:flex; justify-content:space-between; align-items:center; border-top:1px solid #f1efe9; padding-top:11px; gap:4px; color:#9a9990; font-size:9px; }.card-foot b { color:#e16b4b; font-size:9px; white-space:nowrap; }.card-foot b i { font-style:normal; margin-left:4px; }.loading,.empty { padding:45px 0; text-align:center; color:#999; font-size:13px; }.demo-notice { position:fixed; z-index:15; bottom:22px; left:50%; transform:translateX(-50%); max-width:90vw; background:#28352b; color:white; border-radius:10px; padding:14px 18px; box-shadow:0 8px 25px #171e1770; font-size:12px; }.demo-notice button { margin-left:15px; border:0; background:transparent; color:#f7a58a; cursor:pointer; }
    @media(max-width:850px) { .hero-inner { grid-template-columns:1fr .75fr; padding:44px 22px; }.hero-art>img { width:90%; height:240px; }.art-blob { width:95%; }.restaurant-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
    @media(max-width:600px) { .hero-inner { display:block; padding:39px 20px 25px; }.hero-art { height:220px; margin-top:24px; }.hero-art>img { height:190px; width:215px; }.art-blob { width:210px; height:180px; }.floating-note { left:2%; bottom:4px; }.hero-stamp { right:7%; top:0; }.browse { padding:34px 18px 55px; }.browse h2 { font-size:21px; }.restaurant-grid { grid-template-columns:1fr; gap:14px; }.photo-wrap { height:200px; }.open-label { margin-left:0; width:100%; }.result-count { font-size:10px; } }
  `]
})
export class RestaurantListComponent implements OnInit {
  private restaurantService = inject(RestaurantService);
  restaurants = signal<RestaurantCard[]>([]);
  loading = signal(true);
  error = signal(false);
  query = signal('');
  selectedCuisine = signal('Tout');
  favorites = signal<Set<string>>(this.readFavorites());
  filtered = computed(() => this.restaurants().filter(place => {
    const q = this.query().trim().toLocaleLowerCase('fr');
    const matchesText = !q || `${place.name} ${place.description} ${place.cuisine} ${place.address}`.toLocaleLowerCase('fr').includes(q);
    const category = this.selectedCuisine();
    const matchesCategory = category === 'Tout' || place.cuisine.toLocaleLowerCase('fr').includes(category.toLocaleLowerCase('fr'));
    return matchesText && matchesCategory;
  }));

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.loading.set(true);
    this.error.set(false);
    this.restaurantService.getRestaurants().subscribe({
      next: (data) => {
        const live = (data || []).map(place => ({ ...place, cuisine: place.cuisine || 'À découvrir', image: place.imageUrl || this.imageFor(place.name) }));
        this.restaurants.set(live);
        this.loading.set(false);
      }, error: () => { this.restaurants.set([]); this.error.set(true); this.loading.set(false); }
    });
  }
  select(category: string): void { this.selectedCuisine.set(category); }
  focusRestaurants(): void { document.getElementById('restaurants')?.scrollIntoView({ behavior: 'smooth' }); }
  isFavorite(id: string): boolean { return this.favorites().has(id); }
  toggleFavorite(id: string): void {
    const next = new Set(this.favorites());
    if (next.has(id)) next.delete(id); else next.add(id);
    this.favorites.set(next);
    localStorage.setItem('quickroute_favorites', JSON.stringify([...next]));
  }
  private readFavorites(): Set<string> {
    try { return new Set(JSON.parse(localStorage.getItem('quickroute_favorites') || '[]') as string[]); }
    catch { return new Set(); }
  }
  private imageFor(name: string): string { const choice = name.toLocaleLowerCase('fr'); return choice.includes('pizza') ? 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1000&q=85' : 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85'; }
}
