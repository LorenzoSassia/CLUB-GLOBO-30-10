// Defines the data models used throughout the application.

export type Rol = 'Administrador' | 'Socio' | 'Cobrador';

export interface Usuario {
  id: number;
  nombreUsuario: string;
  contrasena: string; // In a real app, this would be a hash
  nombreCompleto: string;
  rol: Rol;
  idSocio?: number; // Link to a Socio if the role is 'Socio'
}

export interface Categoria {
  id: number;
  nombre: string;
  monto: number;
}

export interface Socio {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  direccion: string;
  telefono: string;
  email: string;
  fechaAlta: string;
  status: 'Pago' | 'Impago';
  idCategoria: number;
  idZona: number;
  idCasillero?: number;
}

export interface Actividad {
  id: number;
  nombre: string;
  costo: number;
  turno: string; // e.g., "Mañana", "Tarde", "Mañana - Tarde"
}

export interface Casillero {
  id: number;
  nroCasillero: number;
  montoMensual: number;
  estado: 'Disponible' | 'Ocupado' | 'Mantenimiento';
  idSocio?: number;
}

export interface Zona {
  id: number;
  nombre: string;
}

export interface Cobrador {
  id: number;
  nombre: string;
  zona: string; // As per DB dump
}

export interface SocioActividad {
    id: number;
    idSocio: number;
    idActividad: number;
}

export interface Cobranza {
  id: number;
  idSocio: number;
  idCobrador: number;
  mes: string; // "Junio"
  fechaEmision: string;
  monto: number;
  estado: 'Pago' | 'Impago' | 'Vencido'; // Enriched from DB's "Pago"
  recargo: number | null;
  descuento: number;
}
