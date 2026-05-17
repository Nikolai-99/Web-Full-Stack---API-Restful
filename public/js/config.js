/**
 * config.js — Configuración global compartida
 * =============================================
 * Fuente única de verdad para la URL base de la API.
 * Todos los módulos que realizan fetch() importan desde aquí.
 */

export const API_BASE = window.location.origin;
