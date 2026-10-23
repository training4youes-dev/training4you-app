/**
 * Datos de ejemplo antiguos. El catálogo vivo está en Supabase (tabla cursos)
 * y se gestiona desde /admin/cursos.
 */
export type Curso = {
	slug: string;
	nombre: string;
	area: string;
	aprender: string;
	duracion: string;
	modalidad: string;
	idioma: string;
	incluye: string;
	foto: string;
	estado: 'confirmado' | 'proximamente';
	publicado: boolean;
	dirigido: string;
	contenidos: string[];
	requisitos: string;
	herramientas: string;
	asistencia: string;
	certificado: string;
};
