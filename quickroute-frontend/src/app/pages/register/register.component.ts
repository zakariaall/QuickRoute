import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApplicationType, NewProfessionalApplication, ProfessionalApplication, ProfessionalApplicationService } from '../../services/professional-application.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="register-page">
      <header><p>REJOIGNEZ QUICKROUTE</p><h1>Créer votre compte</h1><span>Choisissez le type de compte qui vous correspond.</span></header>

      <div class="type-picker" role="tablist" aria-label="Type de compte">
        <button type="button" [class.selected]="kind === 'CUSTOMER'" (click)="selectKind('CUSTOMER')">Client</button>
        <button type="button" [class.selected]="kind === 'RESTAURANT'" (click)="selectKind('RESTAURANT')">Restaurant</button>
        <button type="button" [class.selected]="kind === 'DRIVER'" (click)="selectKind('DRIVER')">Livreur</button>
      </div>

      @if (kind === 'CUSTOMER') {
        <article class="form-card">
          <h2>Un compte pour commander</h2><p>Créez votre compte sécurisé, puis découvrez les restaurants et suivez vos commandes.</p>
          <button class="primary" type="button" (click)="auth.register('/restaurants')">Créer mon compte client</button>
        </article>
      } @else {
        <form class="form-card" (ngSubmit)="submit()">
          <h2>{{ kind === 'RESTAURANT' ? 'Proposer votre restaurant' : 'Devenir livreur' }}</h2>
          @if (auth.token()) {
            <p class="intro">Votre demande sera vérifiée par notre équipe avant l’activation de l’espace professionnel.</p>
            <p class="account-note">Demande liée à votre compte {{ auth.user()?.name }}.</p>
          } @else {
            <p class="intro">Remplissez cette demande une seule fois. À l’étape suivante, créez votre compte sécurisé ou connectez-vous. La demande sera envoyée automatiquement.</p>
          }
          <label for="app-name">{{ kind === 'RESTAURANT' ? 'Nom du restaurant' : 'Nom complet' }}</label>
          <input id="app-name" name="name" [(ngModel)]="name" required maxlength="180" autocomplete="name">
          <div class="two-fields">
            <div><label for="app-email">E-mail</label><input id="app-email" name="email" type="email" [(ngModel)]="email" required maxlength="255" autocomplete="email" [readonly]="!!auth.token()"></div>
            <div><label for="app-phone">Téléphone</label><input id="app-phone" name="phone" type="tel" [(ngModel)]="phone" required maxlength="30" autocomplete="tel"></div>
          </div>
          @if (kind === 'RESTAURANT') {
            <label for="app-address">Adresse du restaurant</label><input id="app-address" name="address" [(ngModel)]="address" required maxlength="500" autocomplete="street-address">
            <label for="app-details">Présentez votre restaurant</label><textarea id="app-details" name="details" [(ngModel)]="details" rows="3" maxlength="3000" placeholder="Type de cuisine, horaires, informations utiles…"></textarea>
          } @else {
            <label for="app-address">Ville et quartier</label><input id="app-address" name="address" [(ngModel)]="address" required maxlength="500" placeholder="Casablanca, quartier…">
            <label for="app-details">Véhicule et expérience</label><textarea id="app-details" name="details" [(ngModel)]="details" rows="3" maxlength="3000" placeholder="Type de véhicule, disponibilité…"></textarea>
            <small>Les documents de vérification seront demandés lors de l’étape de validation.</small>
          }
          @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
          @if (success()) { <p class="success" role="status">Votre demande a été envoyée. Vous pourrez suivre sa validation ici.</p> }
          <button class="primary" type="submit" [disabled]="submitting()">{{ submitting() ? 'Envoi…' : (auth.token() ? 'Envoyer ma demande' : 'Continuer') }}</button>
          @if (!auth.token()) { <button class="secondary" type="button" (click)="continueWithExistingAccount()">J’ai déjà un compte — me connecter</button> }
        </form>
      }

      @if (auth.token() && applications().length) {
        <section class="applications"><h2>Mes demandes</h2>
          @for (application of applications(); track application.id) {
            <article><div><strong>{{ application.applicationType === 'RESTAURANT' ? 'Restaurant' : 'Livreur' }}</strong><small>{{ application.createdAt | date:'d MMM yyyy':'':'fr-MA' }}</small></div><span [class.approved]="application.status === 'APPROVED'" [class.rejected]="application.status === 'REJECTED'">{{ statusLabel(application.status) }}</span></article>
            @if (application.applicationType === 'RESTAURANT' && application.status === 'APPROVED') { <a class="manage-link" routerLink="/restaurant/manage">Ouvrir mon espace restaurant →</a> }
            @if (application.applicationType === 'DRIVER' && application.status === 'APPROVED') { <a class="manage-link" routerLink="/driver/deliveries">Ouvrir mon espace livreur →</a> }
          }
        </section>
      }
      <a class="back" routerLink="/restaurants">← Retour aux restaurants</a>
    </section>
  `,
  styles: [`
    :host { display:block; min-height:calc(100vh - 78px); background:#fffefa; color:#283028; }
    .register-page { max-width:620px; margin:auto; padding:50px 24px 70px; }header p { margin:0 0 8px; color:#d96949; font-size:10px; font-weight:800; letter-spacing:1.5px; }header h1 { margin:0 0 7px; font:800 32px Manrope,sans-serif; letter-spacing:-.8px; }header>span { color:#85867e; font-size:13px; }
    .type-picker { display:grid; grid-template-columns:repeat(3,1fr); gap:5px; margin:25px 0 13px; padding:5px; border:1px solid #eeeae2; border-radius:10px; background:#f7f5ef; }.type-picker button { border:0; border-radius:7px; padding:10px; background:transparent; color:#6f736b; font:700 12px Manrope,sans-serif; cursor:pointer; }.type-picker button.selected { background:white; color:#29352b; box-shadow:0 2px 7px #39342214; }
    .form-card,.applications { padding:23px; border:1px solid #eeeae2; border-radius:12px; background:white; box-shadow:0 8px 20px #3d38240b; }.form-card h2,.applications h2 { margin:0 0 7px; font:750 18px Manrope,sans-serif; }.form-card>p { color:#77796f; font-size:12px; line-height:1.55; }.form-card .intro { margin:0 0 18px; }.form-card .account-note { margin:0 0 15px; padding:10px 12px; border-radius:7px; background:#f6f4ee; color:#62665d; font-size:11px; }.form-card label { display:block; margin:14px 0 6px; color:#565b52; font-size:11px; font-weight:750; }.form-card input,.form-card textarea { width:100%; box-sizing:border-box; border:1px solid #e6e3da; border-radius:7px; padding:11px; color:#283028; font:13px inherit; font-family:inherit; }.form-card textarea { resize:vertical; }.form-card input:focus,.form-card textarea:focus { outline:2px solid #d9694933; border-color:#d96949; }.two-fields { display:grid; grid-template-columns:1fr 1fr; gap:12px; }.two-fields>div { min-width:0; }.primary { width:100%; margin-top:19px; border:0; border-radius:7px; padding:13px; background:#29352b; color:white; font-size:12px; font-weight:750; cursor:pointer; }.primary:disabled { opacity:.5; }.secondary { width:100%; margin-top:9px; border:1px solid #e6e3da; border-radius:7px; padding:12px; background:white; color:#424a41; font-size:12px; font-weight:750; cursor:pointer; }.form-card small { color:#85867e; font-size:10px; }.error,.success { font-size:12px; }.error { color:#ad3f31; }.success { color:#427144; }.applications { margin-top:14px; }.applications article { display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #f0eee8; font-size:12px; }.applications article:last-child { border:0; padding-bottom:0; }.applications article div { display:grid; gap:4px; }.applications article small { color:#898a82; font-size:10px; }.applications article>span { color:#9b6921; background:#fff1db; border-radius:20px; padding:5px 8px; font-size:10px; font-weight:750; }.applications article>span.approved { background:#eaf3e8; color:#577b50; }.applications article>span.rejected { background:#fff0ed; color:#a83d32; }.back { display:block; margin-top:20px; color:#bf6043; font-size:12px; text-align:center; text-decoration:none; }
    @media(max-width:540px) { .register-page { padding:35px 17px 55px; }header h1 { font-size:28px; }.form-card,.applications { padding:18px; }.two-fields { grid-template-columns:1fr; gap:0; } }
  `]
})
export class RegisterComponent implements OnInit {
  auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private applicationsService = inject(ProfessionalApplicationService);
  kind: 'CUSTOMER' | ApplicationType = 'CUSTOMER';
  name = '';
  email = '';
  phone = '';
  address = '';
  details = '';
  submitting = signal(false);
  error = signal('');
  success = signal('');
  applications = signal<ProfessionalApplication[]>([]);

  ngOnInit(): void {
    const pending = sessionStorage.getItem('quickroute_application_draft');
    if (this.auth.token()) {
      this.email = this.auth.user()?.email ?? '';
      this.applicationsService.mine().subscribe({ next: rows => this.applications.set(rows) });
      if (pending && this.route.snapshot.queryParamMap.get('submit') === '1') {
        try {
          const draft = JSON.parse(pending) as NewProfessionalApplication;
          this.kind = draft.applicationType;
          draft.email = this.auth.user()?.email || draft.email;
          this.submitPayload(draft);
        } catch { sessionStorage.removeItem('quickroute_application_draft'); }
      }
    }
  }

  selectKind(kind: 'CUSTOMER' | ApplicationType): void {
    this.kind = kind;
    if (kind === 'DRIVER') this.name = this.auth.user()?.name ?? '';
    if (kind === 'RESTAURANT') this.name = '';
    this.email = this.auth.user()?.email ?? this.email;
  }

  submit(): void {
    this.error.set(''); this.success.set('');
    const draft = this.buildDraft();
    if (!draft) return;
    if (!this.auth.token()) {
      sessionStorage.setItem('quickroute_application_draft', JSON.stringify(draft));
      void this.auth.register('/register?submit=1');
      return;
    }
    this.submitPayload(draft);
  }

  continueWithExistingAccount(): void {
    const draft = this.buildDraft();
    if (!draft) return;
    sessionStorage.setItem('quickroute_application_draft', JSON.stringify(draft));
    void this.auth.login('/register?submit=1');
  }

  private buildDraft(): NewProfessionalApplication | null {
    const draft: NewProfessionalApplication = {
      applicationType: this.kind as ApplicationType,
      name: this.name.trim(), email: this.email.trim(), phone: this.phone.trim(),
      address: this.address.trim(), details: this.details.trim()
    };
    if (!draft.name || !draft.email || !draft.phone || (this.kind === 'RESTAURANT' && !draft.address)) {
      this.error.set('Complétez les champs obligatoires pour continuer.'); return null;
    }
    this.error.set('');
    return draft;
  }

  statusLabel(status: ProfessionalApplication['status']): string {
    return { PENDING: 'En attente', APPROVED: 'Approuvée', REJECTED: 'Refusée' }[status];
  }

  private submitPayload(draft: NewProfessionalApplication): void {
    this.submitting.set(true); this.error.set('');
    this.applicationsService.submit(draft).subscribe({
      next: application => {
        sessionStorage.removeItem('quickroute_application_draft');
        this.applications.update(rows => [application, ...rows]);
        this.success.set('Votre demande a été envoyée. Notre équipe la vérifiera avant activation.');
        this.submitting.set(false);
      },
      error: response => {
        this.error.set(response.status === 409 ? 'Une demande de ce type est déjà en attente.' : 'La demande n’a pas pu être envoyée. Vérifiez la connexion et réessayez.');
        this.submitting.set(false);
      }
    });
  }
}
