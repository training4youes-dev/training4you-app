import pool from './db'

export type EstadoCurso = 'confirmado' | 'proximamente'

export type Curso = {
	id: number
	slug: string
	nombre: string
	area: string | null
	aprender: string
	duracion: string
	modalidad: string
	idioma: string
	incluye: string
	foto: string
	estado: EstadoCurso
	publicado: boolean
	dirigido: string
	contenidos: string[]
	requisitos: string
	herramientas: string
	asistencia: string
	certificado: string
}

export type CursoInput = {
	slug: string
	nombre: string
	area: string
	aprender: string
	duracion: string
	modalidad: string
	idioma: string
	incluye: string
	foto: string
	estado: EstadoCurso
	publicado: boolean
	dirigido: string
	contenidos: string[]
	requisitos: string
	herramientas: string
	asistencia: string
	certificado: string
}

const CAMPOS = `
	id, slug, nombre, area, aprender, duracion, modalidad, idioma, incluye, foto,
	estado, publicado, dirigido, contenidos, requisitos, herramientas, asistencia, certificado
`

function normalizar(row: Curso): Curso {
	return {
		...row,
		contenidos: Array.isArray(row.contenidos) ? row.contenidos : [],
		estado: row.estado === 'proximamente' ? 'proximamente' : 'confirmado',
		area: row.area ?? '',
	}
}

export function slugDesdeNombre(nombre: string) {
	return nombre
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 80)
}

export function contenidosDesdeTexto(texto: string) {
	return texto
		.split(/\r?\n/)
		.map((linea) => linea.trim())
		.filter(Boolean)
}

export async function listarCursos(): Promise<Curso[]> {
	const { rows } = await pool.query<Curso>(
		`SELECT ${CAMPOS} FROM cursos ORDER BY nombre ASC`,
	)
	return rows.map(normalizar)
}

export async function listarCursosPublicados(): Promise<Curso[]> {
	const { rows } = await pool.query<Curso>(
		`SELECT ${CAMPOS}
		 FROM cursos
		 WHERE publicado = true
		 ORDER BY nombre ASC`,
	)
	return rows.map(normalizar)
}

export async function cursoPorId(id: number): Promise<Curso | null> {
	const { rows } = await pool.query<Curso>(
		`SELECT ${CAMPOS} FROM cursos WHERE id = $1`,
		[id],
	)
	return rows[0] ? normalizar(rows[0]) : null
}

export async function cursoPorSlug(slug: string): Promise<Curso | null> {
	const { rows } = await pool.query<Curso>(
		`SELECT ${CAMPOS} FROM cursos WHERE slug = $1`,
		[slug],
	)
	return rows[0] ? normalizar(rows[0]) : null
}

export async function crearCurso(datos: CursoInput): Promise<Curso> {
	const { rows } = await pool.query<Curso>(
		`INSERT INTO cursos (
			slug, nombre, area, aprender, duracion, modalidad, idioma, incluye, foto,
			estado, publicado, dirigido, contenidos, requisitos, herramientas, asistencia, certificado
		) VALUES (
			$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
		)
		RETURNING ${CAMPOS}`,
		[
			datos.slug,
			datos.nombre,
			datos.area || null,
			datos.aprender,
			datos.duracion,
			datos.modalidad,
			datos.idioma,
			datos.incluye,
			datos.foto || '/portada.jpg',
			datos.estado,
			datos.publicado,
			datos.dirigido,
			datos.contenidos,
			datos.requisitos,
			datos.herramientas,
			datos.asistencia,
			datos.certificado,
		],
	)
	return normalizar(rows[0])
}

export async function actualizarCurso(id: number, datos: CursoInput): Promise<Curso | null> {
	const { rows } = await pool.query<Curso>(
		`UPDATE cursos SET
			slug = $2,
			nombre = $3,
			area = $4,
			aprender = $5,
			duracion = $6,
			modalidad = $7,
			idioma = $8,
			incluye = $9,
			foto = $10,
			estado = $11,
			publicado = $12,
			dirigido = $13,
			contenidos = $14,
			requisitos = $15,
			herramientas = $16,
			asistencia = $17,
			certificado = $18,
			actualizado_en = now()
		 WHERE id = $1
		 RETURNING ${CAMPOS}`,
		[
			id,
			datos.slug,
			datos.nombre,
			datos.area || null,
			datos.aprender,
			datos.duracion,
			datos.modalidad,
			datos.idioma,
			datos.incluye,
			datos.foto || '/portada.jpg',
			datos.estado,
			datos.publicado,
			datos.dirigido,
			datos.contenidos,
			datos.requisitos,
			datos.herramientas,
			datos.asistencia,
			datos.certificado,
		],
	)
	return rows[0] ? normalizar(rows[0]) : null
}

export async function borrarCurso(id: number) {
	await pool.query('DELETE FROM cursos WHERE id = $1', [id])
}

export function cursoDesdeFormulario(datos: FormData): CursoInput {
	const nombre = String(datos.get('nombre') ?? '').trim()
	const slugRaw = String(datos.get('slug') ?? '').trim()
	const estadoRaw = String(datos.get('estado') ?? 'confirmado')
	const estado: EstadoCurso = estadoRaw === 'proximamente' ? 'proximamente' : 'confirmado'

	return {
		nombre,
		slug: slugRaw || slugDesdeNombre(nombre),
		// Para Emma área y curso son lo mismo: un solo nombre en web y formulario
		area: nombre,
		aprender: String(datos.get('aprender') ?? '').trim(),
		duracion: String(datos.get('duracion') ?? '').trim(),
		modalidad: String(datos.get('modalidad') ?? '').trim() || 'Aula virtual',
		idioma: String(datos.get('idioma') ?? '').trim() || 'Castellano',
		incluye: String(datos.get('incluye') ?? '').trim(),
		foto:
			String(datos.get('foto_manual') ?? datos.get('foto') ?? '').trim() || '/portada.jpg',
		estado,
		publicado: datos.get('publicado') === 'on' || datos.get('publicado') === 'true',
		dirigido: String(datos.get('dirigido') ?? '').trim(),
		contenidos: contenidosDesdeTexto(String(datos.get('contenidos') ?? '')),
		requisitos: String(datos.get('requisitos') ?? '').trim(),
		herramientas: String(datos.get('herramientas') ?? '').trim(),
		asistencia: String(datos.get('asistencia') ?? '').trim(),
		certificado: String(datos.get('certificado') ?? '').trim(),
	}
}
