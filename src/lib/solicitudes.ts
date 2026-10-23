export type EstadoSolicitud = 'nueva' | 'leida' | 'contactada'

export type Solicitud = {
	id: number
	nombre: string
	apellidos: string
	email: string
	whatsapp: string | null
	motivo: string | null
	curso_slug: string | null
	area: string | null
	mensaje: string | null
	estado: EstadoSolicitud
	creado_en: Date | string
}

export const ESTADOS_SOLICITUD: { valor: EstadoSolicitud; etiqueta: string }[] = [
	{ valor: 'nueva', etiqueta: 'Nueva' },
	{ valor: 'leida', etiqueta: 'Leída' },
	{ valor: 'contactada', etiqueta: 'Contactada' },
]

export function formatearFecha(valor: Date | string) {
	const fecha = valor instanceof Date ? valor : new Date(valor)
	if (Number.isNaN(fecha.getTime())) return '—'
	return fecha.toLocaleString('es-ES', {
		dateStyle: 'short',
		timeStyle: 'short',
	})
}

export function etiquetaMotivo(motivo: string | null) {
	if (motivo === 'plaza') return 'Solicitar plaza'
	if (motivo === 'ayuda') return 'Ayuda para elegir'
	if (motivo === 'informacion') return 'Información'
	return motivo || '—'
}

export function normalizarEstado(valor: unknown): EstadoSolicitud {
	if (valor === 'leida' || valor === 'contactada') return valor
	return 'nueva'
}

export function etiquetaEstado(estado: string | null | undefined) {
	const n = normalizarEstado(estado)
	return ESTADOS_SOLICITUD.find((e) => e.valor === n)?.etiqueta ?? 'Nueva'
}

export const CAMPOS_SOLICITUD = `
	id, nombre, apellidos, email, whatsapp, motivo, curso_slug, area, mensaje, estado, creado_en
`
