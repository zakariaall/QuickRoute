import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeFrMA from '@angular/common/locales/fr-MA';
import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(localeFrMA);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
