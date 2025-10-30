
import { Routes } from '@angular/router';
import { InvitadoComponent } from './components/invitado/invitado.component';
import { LoginComponent } from './components/login/login.component';
import { autenticacionGuard } from './guards/autenticacion.guard';

// Paneles de Roles
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SociosComponent } from './components/socios/socios.component';
import { ActividadesComponent } from './components/actividades/actividades.component';
import { CasillerosComponent } from './components/casilleros/casilleros.component';
import { CobranzasComponent } from './components/cobranzas/cobranzas.component';
import { RendicionComponent } from './components/rendicion/rendicion.component';
import { SocioDashboardComponent } from './components/socio-dashboard/socio-dashboard.component';
import { CobradorDashboardComponent } from './components/cobrador-dashboard/cobrador-dashboard.component';


export const APP_ROUTES: Routes = [
  // Rutas Públicas
  { path: 'invitado', component: InvitadoComponent, title: 'Bienvenido al Club El Globo' },
  { path: 'login', component: LoginComponent, title: 'Iniciar Sesión' },
  
  // Rutas Protegidas por Rol
  {
    path: 'panel',
    canActivate: [autenticacionGuard],
    data: { rol: 'Administrador' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, title: 'Dashboard' },
      { path: 'socios', component: SociosComponent, title: 'Gestión de Socios' },
      { path: 'actividades', component: ActividadesComponent, title: 'Gestión de Actividades' },
      { path: 'casilleros', component: CasillerosComponent, title: 'Gestión de Casilleros' },
      { path: 'cobranzas', component: CobranzasComponent, title: 'Cobranzas' },
      { path: 'rendicion', component: RendicionComponent, title: 'Rendición y Pagos' },
    ]
  },
  { 
    path: 'portal-socio',
    component: SocioDashboardComponent,
    canActivate: [autenticacionGuard],
    data: { rol: 'Socio' },
    title: 'Portal del Socio'
  },
  { 
    path: 'portal-cobrador', 
    component: CobradorDashboardComponent,
    canActivate: [autenticacionGuard],
    data: { rol: 'Cobrador' },
    title: 'Portal del Cobrador'
  },

  // Redirecciones
  { path: '', redirectTo: 'invitado', pathMatch: 'full' },
  { path: '**', redirectTo: 'invitado' }
];