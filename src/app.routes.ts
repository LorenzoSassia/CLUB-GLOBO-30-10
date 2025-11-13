import { Routes } from '@angular/router';
import { InvitadoComponent } from './components/invitado/invitado.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/autenticacion.guard';

// 1. IMPORTA EL NUEVO "MARCO"
// (Asumimos que está en components/panel-layout/panel-layout.component)
import { PanelLayoutComponent } from './components/panel-layout/panel-layout.component';

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
    
    // 2. ¡AQUÍ ESTÁ LA CORRECCIÓN!
    // Le decimos a Angular que cargue el "Marco" (PanelLayoutComponent)
    component: PanelLayoutComponent, 
    
    canActivate: [authGuard],
    data: { rol: 'admin' },
    
    // 3. Tus rutas hijas (Dashboard, Socios, etc.)
    //    se cargarán DENTRO del <router-outlet> del "Marco"
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
    canActivate: [authGuard],
    data: { rol: 'socio' },
    title: 'Portal del Socio'
  },
  { 
    path: 'portal-cobrador', 
    component: CobradorDashboardComponent,
    canActivate: [authGuard],
    data: { rol: 'cobrador' },
    title: 'Portal del Cobrador'
  },

  // Redirecciones
  { path: '', redirectTo: 'invitado', pathMatch: 'full' },
  { path: '**', redirectTo: 'invitado' }
];