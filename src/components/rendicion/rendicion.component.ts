import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-rendicion',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="animate-fade-in">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Rendición y Pagos</h1>
    <p class="text-gray-500 dark:text-gray-400">Resumen de cobranzas y comisiones.</p>
  </div>

  <!-- Totals -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center space-x-4">
      <div class="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
        <svg class="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"></path></svg>
      </div>
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Total Recaudado</p>
        <p class="text-2xl font-bold text-gray-800 dark:text-white">$\{{ totales().totalRecaudado | number:'1.2-2' }}</p>
      </div>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center space-x-4">
      <div class="bg-red-100 dark:bg-red-900/50 p-3 rounded-full">
        <svg class="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Total Comisiones</p>
        <p class="text-2xl font-bold text-gray-800 dark:text-white">$\{{ totales().totalComisiones | number:'1.2-2' }}</p>
      </div>
    </div>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center space-x-4">
      <div class="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
        <svg class="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
      </div>
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Neto a Rendir</p>
        <p class="text-2xl font-bold text-gray-800 dark:text-white">$\{{ totales().totalARendir | number:'1.2-2' }}</p>
      </div>
    </div>
  </div>

  <!-- Payments Table -->
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
    <div class="p-6 border-b dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Historial de Pagos</h2>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
          <tr>
            <th scope="col" class="px-6 py-3">ID Pago</th>
            <th scope="col" class="px-6 py-3">Fecha de Pago</th>
            <th scope="col" class="px-6 py-3">Socio</th>
            <th scope="col" class="px-6 py-3">Período</th>
            <th scope="col" class="px-6 py-3">Cobrador</th>
            <th scope="col" class="px-6 py-3 text-right">Importe Pagado</th>
            <th scope="col" class="px-6 py-3 text-right">Comisión</th>
          </tr>
        </thead>
        <tbody>
          @for (pago of rendicionData(); track pago.id) {
            <tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ pago.id }}</td>
              <td class="px-6 py-4">{{ pago.fechaPago | date:'dd/MM/yyyy' }}</td>
              <td class="px-6 py-4 text-gray-800 dark:text-gray-200">{{ pago.nombreSocio }}</td>
              <td class="px-6 py-4">{{ pago.periodo }}</td>
              <td class="px-6 py-4">{{ pago.cobrador }}</td>
              <td class="px-6 py-4 text-right font-mono text-gray-800 dark:text-gray-200">$\{{ pago.importePagado | number:'1.2-2' }}</td>
              <td class="px-6 py-4 text-right font-mono text-red-600 dark:text-red-500">$\{{ pago.comisionCobrador | number:'1.2-2' }}</td>
            </tr>
          } @empty {
            <tr>
                <td colspan="7" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <p class="text-lg">No se encontraron pagos registrados.</p>
                    <p class="text-sm">Cuando se registren pagos, aparecerán aquí.</p>
                </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RendicionComponent {
  private dataService = inject(DataService);

  // FIX: Derive 'pagos' from 'cobranzas' with 'Pago' status, as the 'pagos' signal is obsolete.
  pagos = computed(() => this.dataService.cobranzas().filter(c => c.estado === 'Pago'));
  
  // FIX: Refactor 'rendicionData' to use the new 'Cobranza' model instead of 'Pago' and 'Cupon'.
  rendicionData = computed(() => {
    const todosLosPagos = this.pagos();
    const todosLosSocios = this.dataService.socios();
    const todosLosCobradores = this.dataService.cobradores();

    return todosLosPagos.map(pago => {
      const socio = todosLosSocios.find(s => s.id === pago.idSocio);
      const cobrador = todosLosCobradores.find(c => c.id === pago.idCobrador);
      return {
        id: pago.id,
        fechaPago: pago.fechaEmision,
        // FIX: Use 'socio.nombre' as 'apellido' is not a property of Socio.
        nombreSocio: socio ? socio.nombre : 'Desconocido',
        periodo: pago.mes,
        cobrador: cobrador ? cobrador.nombre : 'N/A',
        importePagado: pago.monto,
        comisionCobrador: pago.monto * 0.05 // Assuming a 5% commission for demo purposes.
      };
    }).sort((a,b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime());
  });

  totales = computed(() => {
      const pagos = this.rendicionData();
      const totalRecaudado = pagos.reduce((acc, p) => acc + p.importePagado, 0);
      const totalComisiones = pagos.reduce((acc, p) => acc + p.comisionCobrador, 0);
      const totalARendir = totalRecaudado - totalComisiones;
      return { totalRecaudado, totalComisiones, totalARendir };
  });

}
