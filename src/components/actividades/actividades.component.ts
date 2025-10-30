
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
// FIX: Correct service name and path to DataService and data.service.ts
import { DataService } from '../../services/data.service';
import { Actividad } from '../../models/models';

@Component({
  selector: 'app-actividades',
  // FIX: Make component standalone as it's loaded via routing.
  standalone: true,
  templateUrl: './actividades.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class ActividadesComponent {
  // FIX: Inject DataService instead of DatosService
  private dataService = inject(DataService);
  private fb: FormBuilder = inject(FormBuilder);
  
  actividades = this.dataService.actividades;

  // Modal state for Add/Edit
  modalAbierto = signal(false);
  actividadEditando = signal<Actividad | null>(null);

  // Modal state for Delete
  modalEliminarAbierto = signal(false);
  actividadParaEliminar = signal<Actividad | null>(null);

  formularioActividad = this.fb.group({
    nombre: ['', Validators.required],
    costo: [0, [Validators.required, Validators.min(0)]],
    turno: ['Mañana', Validators.required]
  });

  abrirModal(actividad: Actividad | null) {
    this.actividadEditando.set(actividad);
    if (actividad) {
      this.formularioActividad.patchValue(actividad);
    } else {
      this.formularioActividad.reset({ turno: 'Mañana', costo: 0 });
    }
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.actividadEditando.set(null);
  }

  guardarActividad() {
    if (this.formularioActividad.invalid) return;

    const valorFormulario = this.formularioActividad.value;
    const editando = this.actividadEditando();

    if (editando) {
      const actividadActualizada: Actividad = {
        ...editando,
        nombre: valorFormulario.nombre!,
        costo: valorFormulario.costo!,
        turno: valorFormulario.turno!
      };
      this.dataService.updateActividad(actividadActualizada);
    } else {
      const nuevaActividad: Omit<Actividad, 'id'> = {
        nombre: valorFormulario.nombre!,
        costo: valorFormulario.costo!,
        turno: valorFormulario.turno!
      };
      this.dataService.addActividad(nuevaActividad);
    }
    this.cerrarModal();
  }

  iniciarEliminacion(actividad: Actividad) {
    this.actividadParaEliminar.set(actividad);
    this.modalEliminarAbierto.set(true);
  }

  cancelarEliminacion() {
    this.modalEliminarAbierto.set(false);
    this.actividadParaEliminar.set(null);
  }

  confirmarEliminacion() {
    const actividad = this.actividadParaEliminar();
    if (actividad) {
      this.dataService.deleteActividad(actividad.id);
      this.cancelarEliminacion();
    }
  }
}
