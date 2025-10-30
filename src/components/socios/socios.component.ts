import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Socio } from '../../models/models';

type SocioEnriquecido = Omit<Socio, 'nombre' | 'apellido'> & { nombre: string; apellido: string, nombreCategoria: string; nombreCompleto: string; moroso: boolean };

@Component({
  selector: 'app-socios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './socios.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SociosComponent {
  private dataService = inject(DataService);
  private fb: FormBuilder = inject(FormBuilder);
  
  modalAbierto = signal(false);
  socioEditando = signal<SocioEnriquecido | null>(null);

  modalEliminarAbierto = signal(false);
  socioParaEliminar = signal<SocioEnriquecido | null>(null);
  
  filtro = signal('');
  paginaActual = signal(1);
  sociosPorPagina = signal(10);
  sortColumn = signal<'id' | 'nombreCompleto' | 'nombreCategoria' | 'moroso'>('id');
  sortDirection = signal<'asc' | 'desc'>('asc');

  categorias = this.dataService.categorias;
  zonas = this.dataService.zonas;

  sociosEnriquecidos = this.dataService.sociosEnriquecidos;

  estadisticas = computed(() => {
    const socios = this.sociosEnriquecidos();
    const total = socios.length;
    const morosos = socios.filter(s => s.moroso).length;
    const alDia = total - morosos;
    return { total, alDia, morosos };
  });

  sociosFiltrados = computed(() => {
    const socios = this.sociosEnriquecidos();
    const terminoBusqueda = this.filtro().toLowerCase();
    if (!terminoBusqueda) return socios;
    return socios.filter(s => s.nombreCompleto.toLowerCase().includes(terminoBusqueda));
  });

  sociosOrdenados = computed(() => {
    const socios = [...this.sociosFiltrados()];
    const col = this.sortColumn();
    const dir = this.sortDirection();

    return socios.sort((a, b) => {
      const valA = a[col];
      const valB = b[col];
      const comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
      return dir === 'asc' ? comparison : -comparison;
    });
  });

  sociosPaginados = computed(() => {
    const socios = this.sociosOrdenados();
    const inicio = (this.paginaActual() - 1) * this.sociosPorPagina();
    const fin = inicio + this.sociosPorPagina();
    return socios.slice(inicio, fin);
  });
  
  totalPaginas = computed(() => {
    return Math.ceil(this.sociosFiltrados().length / this.sociosPorPagina());
  });

  formularioSocio = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    dni: ['', Validators.required],
    fechaNacimiento: ['', Validators.required],
    direccion: ['', Validators.required],
    telefono: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    idCategoria: [0, [Validators.required, Validators.min(1)]],
    idZona: [0, [Validators.required, Validators.min(1)]],
  });
  
  actualizarFiltro(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filtro.set(input.value);
    this.paginaActual.set(1);
  }

  cambiarSort(columna: 'id' | 'nombreCompleto' | 'nombreCategoria' | 'moroso') {
    if (this.sortColumn() === columna) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(columna);
      this.sortDirection.set('asc');
    }
    this.paginaActual.set(1);
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina > 0 && nuevaPagina <= this.totalPaginas()) {
      this.paginaActual.set(nuevaPagina);
    }
  }

  abrirModal(socio: SocioEnriquecido | null) {
    this.socioEditando.set(socio);
    if (socio) {
      this.formularioSocio.patchValue(socio);
    } else {
      this.formularioSocio.reset({
        idCategoria: 0,
        idZona: 0
      });
    }
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.socioEditando.set(null);
  }

  guardarSocio() {
    if (this.formularioSocio.invalid) return;

    const valorFormulario = this.formularioSocio.getRawValue();
    const editando = this.socioEditando();
    
    if (editando) {
      const socioActualizado: Socio = {
        ...editando,
        nombre: valorFormulario.nombre!,
        apellido: valorFormulario.apellido!,
        dni: valorFormulario.dni!,
        fechaNacimiento: valorFormulario.fechaNacimiento!,
        direccion: valorFormulario.direccion!,
        telefono: valorFormulario.telefono!,
        email: valorFormulario.email!,
        idCategoria: +valorFormulario.idCategoria!,
        idZona: +valorFormulario.idZona!
      };
      this.dataService.updateSocio(socioActualizado);
    } else {
      const nuevoSocio: Omit<Socio, 'id'> = {
        nombre: valorFormulario.nombre!,
        apellido: valorFormulario.apellido!,
        dni: valorFormulario.dni!,
        fechaNacimiento: valorFormulario.fechaNacimiento!,
        direccion: valorFormulario.direccion!,
        telefono: valorFormulario.telefono!,
        email: valorFormulario.email!,
        idCategoria: +valorFormulario.idCategoria!,
        idZona: +valorFormulario.idZona!,
        fechaAlta: new Date().toISOString().split('T')[0],
        status: 'Pago',
      };
      this.dataService.addSocio(nuevoSocio);
    }
    this.cerrarModal();
  }

  iniciarEliminacion(socio: SocioEnriquecido) {
    this.socioParaEliminar.set(socio);
    this.modalEliminarAbierto.set(true);
  }

  cancelarEliminacion() {
    this.modalEliminarAbierto.set(false);
    this.socioParaEliminar.set(null);
  }

  confirmarEliminacion() {
    const socio = this.socioParaEliminar();
    if (socio) {
      this.dataService.deleteSocio(socio.id);
      this.cancelarEliminacion();
    }
  }
}
