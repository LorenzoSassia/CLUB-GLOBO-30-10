export interface UsuarioLogueado {
  id: number;         // ID de la tabla de usuarios
  usuario: string;    // El login (ej: "jperez")
  rol: string;
  idSocio?: number;  // ID de la tabla de socios (si aplica)
  nombreCompleto?: string; // "Juan Perez" (si aplica)
}

/**
 * Esto es lo que devuelve el endpoint de Login.
 * Contiene el token Y el objeto del usuario detallado.
 */
export interface RespuestaLogin {
  token: string;
  usuario: UsuarioLogueado; // <-- El objeto anidado con toda la info
}


/**
 * Esta interfaz parece ser para un listado simple de usuarios.
 * La mantendré por si la usas en otro lado.
 */
export interface Usuario {
  id: number;
  usuario: string;
  rol: string;
}