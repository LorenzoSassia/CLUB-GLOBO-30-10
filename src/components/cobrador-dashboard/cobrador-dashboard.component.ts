import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/autenticacion.service';
import { DataService } from '../../services/data.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-cobrador-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cobrador-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CobradorDashboardComponent {
  private autenticacionService = inject(AuthService);
  private dataService = inject(DataService);

  cobrador = toSignal(this.autenticacionService.usuarioActual);

  // Central computed signal for all view data
  private vistaCobrador = computed(() => {
    const cobradorActual = this.cobrador();
    if (!cobradorActual) {
      return {
        estadisticas: { totalRecaudado: 0, comisionGanada: 0, cobranzasPendientes: 0 },
        listaSocios: [],
        pagosRecientes: []
      };
    }

    // FIX: Find the cobrador record to get their ID for filtering.
    const cobradorInfo = this.dataService.cobradores().find(c => c.nombre === cobradorActual.usuario.nombreCompleto);
    const cobradorId = cobradorInfo?.id;

    const todasLasCobranzas = this.dataService.cobranzas();
    const todosLosSocios = this.dataService.socios();

    // FIX: Filter cobranzas by the current cobrador's ID.
    const cobranzasDelCobrador = cobradorId ? todasLasCobranzas.filter(c => c.idCobrador === cobradorId) : [];

    // FIX: Base the list of socios on those with unpaid bills assigned to the cobrador.
    const listaSocios = todosLosSocios
      .map(socio => {
        const cobranzasSocio = todasLasCobranzas
            .filter(c => c.idSocio === socio.id)
            .sort((a, b) => new Date(b.fechaEmision).getTime() - new Date(a.fechaEmision).getTime());
        
        const ultimaCobranza = cobranzasSocio.length > 0 ? cobranzasSocio[0] : null;

        // Only include socios with pending payments.
        if (ultimaCobranza && (ultimaCobranza.estado === 'Impago' || ultimaCobranza.estado === 'Vencido')) {
          return {
              idSocio: socio.id,
              nombreSocio: socio.nombre,
              ultimaCobranza: ultimaCobranza
          };
        }
        return null;
    })
    .filter(Boolean) // Remove nulls
    .sort((a: any, b: any) => {
        const statusOrder: { [key: string]: number } = { 'Vencido': 1, 'Impago': 2, 'Pago': 3 };
        const getStatusPriority = (item: { ultimaCobranza: { estado: string } | null }) => {
            if (!item.ultimaCobranza) return 4;
            return statusOrder[item.ultimaCobranza.estado as keyof typeof statusOrder] ?? 4;
        };
        
        const priorityA = getStatusPriority(a);
        const priorityB = getStatusPriority(b);
        
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        return a.nombreSocio.localeCompare(b.nombreSocio);
    });

    // 3. Calculate statistics from paid cobranzas by this collector.
    const pagos = cobranzasDelCobrador
        .filter(p => p.estado === 'Pago')
        .sort((a, b) => new Date(b.fechaEmision).getTime() - new Date(a.fechaEmision).getTime());

    const totalRecaudado = pagos.reduce((acc, p) => acc + p.monto, 0);
    // FIX: Calculate commission based on a fixed rate for the demo.
    const comisionGanada = totalRecaudado * 0.05; // Assuming 5%
    const cobranzasPendientes = listaSocios.length;

    const estadisticas = { totalRecaudado, comisionGanada, cobranzasPendientes };
    const pagosRecientes = pagos.slice(0, 10).map(pago => {
      const socio = todosLosSocios.find(s => s.id === pago.idSocio);
      return {
        ...pago,
        nombreSocio: socio?.nombre ?? 'Desconocido'
      }
    });

    return { estadisticas, listaSocios, pagosRecientes };
  });

  // Data exposed to the template
  estadisticas = computed(() => this.vistaCobrador().estadisticas);
  listaSociosCobranza = computed(() => this.vistaCobrador().listaSocios);
  pagosRecientes = computed(() => this.vistaCobrador().pagosRecientes);

  // FIX: Parameter renamed to reflect it's a cobranza ID.
  registrarPago(idCobranza: number) {
    const cobradorActual = this.cobrador();
    // FIX: Find the cobrador's numeric ID to pass to the service.
    const cobradorInfo = this.dataService.cobradores().find(c => c.nombre === cobradorActual?.usuario.nombreCompleto);
    if (cobradorInfo) {
      this.dataService.registrarPago(idCobranza, cobradorInfo.id);
    } else {
        console.error("No se pudo encontrar el registro del cobrador para registrar el pago.");
    }
  }
}
