/**
 * Catálogo histórico. El listado vivo está en Supabase (tabla cursos)
 * y se gestiona desde /admin/cursos. La web pública lee de la BD.
 */
export type AreaFormativa = {
	slug: string;
	nombre: string;
	descripcion: string;
	foto: string;
};
