import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-invitado',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './invitado.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitadoComponent {
  private dataService = inject(DataService);
  actividades = this.dataService.actividades;

  imagenesGaleria = signal([
    { src: 'https://picsum.photos/seed/pool/800/600', alt: 'Nuestra piscina olímpica', caption: 'Piscina Olímpica' },
    { src: 'https://picsum.photos/seed/tennis/800/600', alt: 'Canchas de tenis de arcilla', caption: 'Canchas de Tenis' },
    { src: 'https://picsum.photos/seed/gym/800/600', alt: 'Gimnasio completamente equipado', caption: 'Gimnasio' },
    { src: 'https://picsum.photos/seed/soccer/800/600', alt: 'Campo de fútbol profesional', caption: 'Fútbol' },
  ]);

  imagenSeleccionadaIndex = signal(0);
  imagenSeleccionada = computed(() => this.imagenesGaleria()[this.imagenSeleccionadaIndex()]);

  seleccionarImagen(index: number) {
    this.imagenSeleccionadaIndex.set(index);
  }
}
