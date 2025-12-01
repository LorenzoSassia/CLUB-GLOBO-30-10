
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavLink {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 h-full bg-gray-800 text-gray-200 flex-shrink-0 flex flex-col transition-all duration-300">
      <div class="p-6 text-center font-bold text-2xl tracking-wider border-b border-gray-700">
        El Globo 🎈
      </div>
      <nav class="mt-6 flex-1 overflow-y-auto">
        <ul class="space-y-2">
          @for (link of navLinks(); track link.path) {
            <li>
              <a 
                [routerLink]="link.path" 
                routerLinkActive="bg-blue-600 text-white shadow-md"
                class="flex items-center px-6 py-3 hover:bg-gray-700 hover:text-white transition-colors duration-200 group">
                <svg class="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path [attr.d]="link.icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                <span class="ml-4 font-medium">{{ link.label }}</span>
              </a>
            </li>
          }
        </ul>
      </nav>
      <div class="p-4 border-t border-gray-700 text-xs text-center text-gray-500">
        &copy; 2025 Club El Globo
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  navLinks = signal<NavLink[]>([
    // ¡RUTAS CORREGIDAS! Ahora apuntan a /panel/...
    { path: '/panel/dashboard', label: 'Dashboard', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { path: '/panel/usuarios', label: 'Usuarios', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { path: '/panel/socios', label: 'Socios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.78-4.125' },
    { path: '/panel/actividades', label: 'Actividades', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { path: '/panel/casilleros', label: 'Casilleros', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
    { path: '/panel/cobranzas', label: 'Cobranzas', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { path: '/panel/rendicion', label: 'Rendición', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
  ]);
}

/*import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavLink {
  path: string;
  label: string;
  icon: string; // SVG path data
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive]
})
export class SidebarComponent {
  navLinks = signal<NavLink[]>([
    { path: '/dashboard', label: 'Dashboard', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { path: '/socios', label: 'Socios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.78-4.125' },
    { path: '/actividades', label: 'Actividades', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { path: '/casilleros', label: 'Casilleros', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
    { path: '/cobranzas', label: 'Cobranzas', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { path: '/rendicion', label: 'Rendición', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
  ]);
}*/
