import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Casillero } from '../../models/models';

type CasilleroEnriquecido = Casillero & { nombreSocio: string };
type EstadoCasillero = 'Disponible' | 'Ocupado' | 'Mantenimiento';

@Component({
  selector: 'app-casillero', // cambiado: antes 'app-cobranzas'
  templateUrl: './casilleros.component.html', // cambiado: antes './cobranzas.component.html'
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CasillerosComponent { // cambiado: antes export class CobranzasComponent
  private dataService = inject(DataService);
  private fb = inject(FormBuilder);

  casilleros = this.dataService.casillerosEnriquecidos;
  
  sociosDisponibles = computed(() => {
    const sociosConCasillero = new Set(
        this.dataService.casilleros()
            .filter(c => c.idSocio != null)
            .map(c => c.idSocio)
    );
    return this.dataService.socios().filter(s => !sociosConCasillero.has(s.id));
  });
  
  modalGestionAbierto = signal(false);
  casilleroSeleccionado = signal<CasilleroEnriquecido | null>(null);
  idSocioParaAsignar = signal<number | null>(null);
  modoModalGestion = signal<'asignar' | 'ver_ocupado' | null>(null);
  confirmandoLiberacion = signal(false);

  modalCRUDAbierto = signal(false);
  casilleroEditando = signal<CasilleroEnriquecido | null>(null);

  modalEliminarAbierto = signal(false);
  casilleroParaEliminar = signal<CasilleroEnriquecido | null>(null);

  formularioCasillero = this.fb.group({
    nroCasillero: this.fb.control<number | null>(null),
    montoMensual: this.fb.control<number | null>(null),
    estado: this.fb.control<EstadoCasillero | null>('Disponible')
  });

  cuponesEnriquecidos: any[] = [];

  generarCupones(): void {
    // TODO: implementar lógica real de generación
    this.cuponesEnriquecidos = []; // placeholder
  }

  trackById(index: number, item: any): any {
    return item?.id ?? index;
  }

  gestionarCasillero(casillero: CasilleroEnriquecido) {
    if (casillero.estado === 'Mantenimiento') return;

    this.casilleroSeleccionado.set(casillero);
    if (casillero.estado === 'Disponible') {
      this.idSocioParaAsignar.set(null);
      this.modoModalGestion.set('asignar');
    } else {
      this.modoModalGestion.set('ver_ocupado');
    }
    this.modalGestionAbierto.set(true);
  }

  cerrarModalGestion() {
    this.modalGestionAbierto.set(false);
    this.casilleroSeleccionado.set(null);
    this.modoModalGestion.set(null);
    this.confirmandoLiberacion.set(false);
  }

  asignarCasillero() {
    const idCasillero = this.casilleroSeleccionado()?.id;
    const idSocio = this.idSocioParaAsignar();
    if (idCasillero && idSocio) {
      this.dataService.asignarCasillero(idCasillero, idSocio);
      this.cerrarModalGestion();
    }
  }

  iniciarLiberacion() {
    this.confirmandoLiberacion.set(true);
  }

  cancelarLiberacion() {
    this.confirmandoLiberacion.set(false);
  }

  confirmarLiberacion() {
    const casillero = this.casilleroSeleccionado();
    if (!casillero) return;
    
    this.dataService.liberarCasillero(casillero.id);
    this.cerrarModalGestion();
  }

  abrirModalCRUD(casillero: CasilleroEnriquecido | null) {
    this.casilleroEditando.set(casillero);
    const nroCasilleroControl = this.formularioCasillero.get('nroCasillero');

    if (casillero) {
      this.formularioCasillero.patchValue(casillero);
      nroCasilleroControl?.disable();
      if (casillero.estado === 'Ocupado') {
        this.formularioCasillero.get('estado')?.disable();
      } else {
        this.formularioCasillero.get('estado')?.enable();
      }
    } else {
      this.formularioCasillero.reset({
        nroCasillero: 0,
        montoMensual: 500,
        estado: 'Disponible'
      });
      nroCasilleroControl?.enable();
      this.formularioCasillero.get('estado')?.enable();
    }
    this.modalCRUDAbierto.set(true);
  }

  cerrarModalCRUD() {
    this.modalCRUDAbierto.set(false);
    this.casilleroEditando.set(null);
  }

  guardarCasillero() {
    if (this.formularioCasillero.invalid) return;

    const valorFormulario = this.formularioCasillero.getRawValue();
    const editando = this.casilleroEditando();

    if (editando) {
      const casilleroActualizado = {
        id: editando.id,
        nroCasillero: editando.nroCasillero, // Not editable
        montoMensual: valorFormulario.montoMensual!,
        estado: valorFormulario.estado!,
      };
      this.dataService.updateCasillero(casilleroActualizado);
    } else {
      this.dataService.addCasillero({
        nroCasillero: valorFormulario.nroCasillero!,
        montoMensual: valorFormulario.montoMensual!,
      });
    }
    this.cerrarModalCRUD();
  }

  iniciarEliminacion(casillero: CasilleroEnriquecido) {
    if (casillero.estado === 'Ocupado') return;
    this.casilleroParaEliminar.set(casillero);
    this.modalEliminarAbierto.set(true);
  }

  cancelarEliminacion() {
    this.modalEliminarAbierto.set(false);
    this.casilleroParaEliminar.set(null);
  }

  confirmarEliminacion() {
    const casillero = this.casilleroParaEliminar();
    if (casillero) {
      this.dataService.deleteCasillero(casillero.id);
      this.cancelarEliminacion();
    }
  }
  someMethodUsandoPatch(casillero: CasilleroEnriquecido) {
    this.formularioCasillero.patchValue(casillero); // ahora compatible con EstadoCasillero
  }

  gauges = [
    {
      label: 'Total Socios',
      value: this.dataService.socios().length
    },
    {
      label: 'Total Casilleros',
      value: this.dataService.casilleros().length
    },
    {
      label: 'Casilleros Disponibles',
      value: this.dataService.casilleros().filter(c => c.estado === 'Disponible').length
    },
    {
      label: 'Casilleros Ocupados',
      value: this.dataService.casilleros().filter(c => c.estado === 'Ocupado').length
    },
    {
      label: 'Casilleros en Mantenimiento',
      value: this.dataService.casilleros().filter(c => c.estado === 'Mantenimiento').length
    },
    {
      label: 'Socios morosos',
      value: this.dataService.socios().filter(s => !!(s as any).moroso).length
    }
  ];
}
