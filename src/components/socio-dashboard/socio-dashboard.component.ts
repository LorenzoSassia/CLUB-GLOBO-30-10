import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/autenticacion.service';
import { DataService } from '../../services/data.service';
import { Casillero } from '../../models/models';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-socio-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './socio-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocioDashboardComponent {
  private autenticacionService = inject(AuthService);
  private dataService = inject(DataService);

 
   usuario = toSignal(this.autenticacionService.usuarioActual);

  // Modal state
  actividadParaBaja = signal<{id: number, nombre: string} | null>(null);
  modalConfirmacionAbierto = signal(false);
  casilleroParaAlquilar = signal<Casillero | null>(null);
  modalAlquilerAbierto = signal(false);
  modalCasillerosDisponiblesAbierto = signal(false);

  // Enriched data for the socio's view
  datosSocio = computed(() => {
    const usuarioActual = this.usuario();
    if (!usuarioActual || !usuarioActual.usuario.idSocio) {
      return {
        socio: null,
        categoria: null,
        casillero: null,
        // FIX: Rename to cobranzas to match the new model.
        cobranzas: [],
        actividadesInscritoIds: new Set<number>(),
      };
    }

    const socio = this.dataService.socios().find(s => s.id === usuarioActual.usuario.idSocio);
    if (!socio) {
      return {
        socio: null,
        categoria: null,
        casillero: null,
        cobranzas: [],
        actividadesInscritoIds: new Set<number>(),
      };
    }

    const categoria = this.dataService.categorias().find(c => c.id === socio.idCategoria);
    const casillero = this.dataService.casilleros().find(c => c.idSocio === socio.id);
    
    // FIX: Use 'cobranzas' service method and sort by date as 'Cupon' model is obsolete.
    const cobranzas = this.dataService.cobranzas()
      .filter(c => c.idSocio === socio.id)
      .sort((a, b) => new Date(b.fechaEmision).getTime() - new Date(a.fechaEmision).getTime());

    // FIX: Get enrolled activities from 'socioActividades' as 'Cobranza' doesn't contain activity details.
    const actividadesInscritoIds = new Set(
      this.dataService.socioActividades()
        .filter(sa => sa.idSocio === socio.id)
        .map(sa => sa.idActividad)
    );

    return {
      socio,
      categoria,
      casillero,
      cobranzas,
      actividadesInscritoIds
    };
  });

  // Data exposed to the template
  socio = computed(() => this.datosSocio().socio);
  categoria = computed(() => this.datosSocio().categoria);
  casillero = computed(() => this.datosSocio().casillero);
  // FIX: Expose 'cobranzas' instead of 'cupones'.
  cobranzas = computed(() => this.datosSocio().cobranzas);
  
  actividadesDisponibles = computed(() => {
      const actividadesInscritoIds = this.datosSocio().actividadesInscritoIds;
      return this.dataService.actividades().map(actividad => ({
          ...actividad,
          inscrito: actividadesInscritoIds.has(actividad.id)
      }));
  });
  
  casillerosDisponibles = computed(() => {
    return this.dataService.casilleros().filter(c => c.estado === 'Disponible');
  });

  tieneFacturaImpaga = computed(() => {
    // FIX: Check payment status from the latest 'cobranza' record.
    const cobranzasSocio = this.cobranzas();
    if (cobranzasSocio.length === 0) return false;
    const ultimaCobranza = cobranzasSocio[0];
    return ultimaCobranza.estado === 'Impago' || ultimaCobranza.estado === 'Vencido';
  });
  
  inscribir(idActividad: number): void {
      const socio = this.socio();
      // FIX: Check socio status directly from the socio object, not a separate 'moroso' flag.
      if (socio && socio.status !== 'Impago') {
          this.dataService.inscribirSocioEnActividad(socio.id, idActividad);
      }
  }

  iniciarBaja(actividad: {id: number, nombre: string}): void {
      this.actividadParaBaja.set(actividad);
      this.modalConfirmacionAbierto.set(true);
  }

  cancelarBaja(): void {
      this.actividadParaBaja.set(null);
      this.modalConfirmacionAbierto.set(false);
  }

  confirmarBaja(): void {
      const socioId = this.socio()?.id;
      const actividad = this.actividadParaBaja();
      if (socioId && actividad) {
          this.dataService.darDeBajaSocioDeActividad(socioId, actividad.id);
      }
      this.cancelarBaja();
  }

  abrirModalCasillerosDisponibles(): void {
    this.modalCasillerosDisponiblesAbierto.set(true);
  }

  cerrarModalCasillerosDisponibles(): void {
    this.modalCasillerosDisponiblesAbierto.set(false);
  }

  iniciarAlquiler(casillero: Casillero): void {
    this.casilleroParaAlquilar.set(casillero);
    this.modalAlquilerAbierto.set(true);
  }

  cancelarAlquiler(): void {
    this.casilleroParaAlquilar.set(null);
    this.modalAlquilerAbierto.set(false);
  }

  confirmarAlquiler(): void {
    const socioId = this.socio()?.id;
    const casillero = this.casilleroParaAlquilar();
    if (socioId && casillero) {
        this.dataService.alquilarCasillero(socioId, casillero.id);
    }
    this.cancelarAlquiler();
    this.cerrarModalCasillerosDisponibles();
  }
}
