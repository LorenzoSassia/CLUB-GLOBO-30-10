import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
// FIX: Switched to DataService for consistency with the rest of the application.
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-dashboard',
  // FIX: Make component standalone as it's loaded via routing.
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  // FIX: Injected DataService and updated variable name.
  private dataService = inject(DataService);
  
  stats = computed(() => {
    // FIX: Using the consistent dataService.
    const socios = this.dataService.socios();
    const actividades = this.dataService.actividades();
    const casilleros = this.dataService.casilleros();
    
    return [
      { 
        label: 'Socios Totales', 
        value: socios.length, 
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.78-4.125',
        color: 'text-blue-500' 
      },
      { 
        label: 'Actividades Ofrecidas', 
        value: actividades.length,
        icon: 'M13 10V3L4 14h7v7l9-11h-7z',
        color: 'text-green-500'
      },
      { 
        label: 'Casilleros Ocupados', 
        value: casilleros.filter(c => c.estado === 'Ocupado').length,
        icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
        color: 'text-yellow-500'
      },
      { 
        label: 'Socios morosos',
        value: socios.filter(s => !!(s as any).moroso).length // cambiado: cast a any para evitar error TS
      }
    ];
  });
}
