import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

console.log('Cargando SAM Frontend - Versión Despliegue Final');

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
