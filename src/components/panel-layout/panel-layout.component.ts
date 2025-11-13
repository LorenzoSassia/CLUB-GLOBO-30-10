import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// 1. Importa la sidebar (¡Ruta corregida!)
// Asumimos que sidebar.component.ts está en 'components/' y este layout en 'components/panel-layout/'
import { SidebarComponent } from '../shared/sidebar/sidebar.component'; 

@Component({
  selector: 'app-panel-layout',
  standalone: true,
  // 2. Importa la Sidebar y el RouterOutlet
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- 3. Dibuja tu Sidebar Corregida -->
      <app-sidebar></app-sidebar>
      
      <!-- 4. Dibuja el contenido (Dashboard, Socios, etc.) aquí -->
      <main class="flex-1 overflow-y-auto p-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelLayoutComponent { 
  // Este componente es solo un "marco", no necesita lógica.
}