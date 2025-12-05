import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-rendicion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rendicion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RendicionComponent {
  private dataService = inject(DataService);

  // FIX: Derive 'pagos' from 'cobranzas' with 'Pago' status, as the 'pagos' signal is obsolete.
  pagos = computed(() => this.dataService.cobranzas().filter(c => c.estado === 'Pago'));
  
  // FIX: Refactor 'rendicionData' to use the new 'Cobranza' model instead of 'Pago' and 'Cupon'.
  rendicionData = computed(() => {
    const todosLosPagos = this.pagos();

    return todosLosPagos.map(pago => {
      return {
        id: pago.id,
        fechaPago: pago.fechaEmision,
        // FIX: Use 'socio.nombre' as 'apellido' is not a property of Socio.
        nombreSocio: pago.nombreSocio,
        periodo: pago.mes,
        nombreCobrador: pago.nombreCobrador,
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
