// FIX: Re-implemented the EncabezadoComponent as a standalone component. The original file content was invalid placeholder text, which caused multiple compilation errors.
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AutenticacionService } from '../../../services/autenticacion.service';

@Component({
  selector: 'app-encabezado',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
      <div class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Page Title -->
          <div>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">{{ pageTitle() }}</h1>
          </div>

          <!-- User Info & Logout -->
          <div>
            @if (usuario(); as user) {
              <div class="flex items-center space-x-4">
                <div class="flex flex-col items-end">
                    <span class="font-medium text-gray-800 dark:text-gray-200">{{ user.nombreCompleto }}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ user.rol }}</span>
                </div>
                <button (click)="logout()"
                        class="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        aria-label="Cerrar sesión">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                </button>
              </div>
            } @else {
              <a routerLink="/login"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg class="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                Iniciar Sesión
              </a>
            }
          </div>
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncabezadoComponent {
  private router = inject(Router);
  private autenticacionService = inject(AutenticacionService);

  pageTitle = toSignal(
    this.router.events.pipe(
      filter((event): event is ActivationEnd => event instanceof ActivationEnd),
      filter((event: ActivationEnd) => event.snapshot.firstChild === null),
      map((event: ActivationEnd) => event.snapshot.data['title'] || 'Club Management')
    ),
    { initialValue: 'Club Management' }
  );

  usuario = this.autenticacionService.usuarioActual;

  logout(): void {
    this.autenticacionService.logout();
  }
}