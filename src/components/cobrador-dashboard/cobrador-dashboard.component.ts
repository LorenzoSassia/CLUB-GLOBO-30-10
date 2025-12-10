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

  usuario = toSignal(this.autenticacionService.usuarioActual);

  // Central computed signal for all view data
  datosCobrador = computed(() => {
    const usuarioActual = this.usuario();
    console.log('Usuario actual en CobradorDashboard:', usuarioActual);
     if (!usuarioActual || !usuarioActual.usuario.idCobrador) {
      return {
        cobrador: null,
        estadisticas: { totalRecaudado: 0, comisionGanada: 0, cobranzasPendientes: 0 },
        listaSocios: [],
        pagosRecientes: []
      };
    }
    const cobrador = this.dataService.cobradores().find(c => c.id === usuarioActual.usuario.idCobrador);
    console.log('Cobrador encontrado:', cobrador);
    if (!cobrador) {
      return {
        cobrador: null,
        estadisticas: { totalRecaudado: 0, comisionGanada: 0, cobranzasPendientes: 0 },
        listaSocios: [],
        pagosRecientes: []
      };
    }

    const todasLasCobranzas = this.dataService.cobranzas();
    const todosLosSocios = this.dataService.socios();

    // FIX: Filter cobranzas by the current cobrador's ID.
    const cobranzasDelCobrador = cobrador ? todasLasCobranzas.filter(c => c.idCobrador === cobrador.id) : [];
    console.log(`Cobranzas para el cobrador ${cobrador.nombre}:`, cobranzasDelCobrador);

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

    return { 
      cobrador, 
      estadisticas, 
      listaSocios, 
      pagosRecientes,
      cobranzasDelCobrador
    };
  });

  // Data exposed to the template
  cobrador = computed(() => this.datosCobrador().cobrador);
  estadisticas = computed(() => this.datosCobrador().estadisticas);
  listaSociosCobranza = computed(() => this.datosCobrador().listaSocios);
  cobranzasDelCobrador = computed(() => this.datosCobrador().cobranzasDelCobrador);
  //pagosRecientes = computed(() => this.datosCobrador().pagosRecientes);

  // FIX: Parameter renamed to reflect it's a cobranza ID.
  registrarPago(idCobranza: number) {
      const cobranzaActualizado = this.cobranzasDelCobrador().find(c => c.id === idCobranza);
      cobranzaActualizado.estado = 'Pago';
      this.dataService.updateCobranza(cobranzaActualizado);
  }
}
