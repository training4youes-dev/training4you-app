/**
 * Iguala la tabla cursos a las 6 áreas que se muestran en la web pública.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const proyecto = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const texto = fs.readFileSync(path.join(proyecto, '.env'), 'utf8')
for (const linea of texto.split(/\r?\n/)) {
	const limpia = linea.trim()
	if (!limpia || limpia.startsWith('#')) continue
	const sep = limpia.indexOf('=')
	if (sep === -1) continue
	const clave = limpia.slice(0, sep).trim()
	let valor = limpia.slice(sep + 1).trim()
	if (
		(valor.startsWith('"') && valor.endsWith('"')) ||
		(valor.startsWith("'") && valor.endsWith("'"))
	) {
		valor = valor.slice(1, -1)
	}
	if (!process.env[clave]) process.env[clave] = valor
}

const comunes = {
	duracion: 'Se concreta al solicitar información o plaza',
	modalidad: 'Aula virtual',
	idioma: 'Castellano',
	incluye: 'Clases en Meet, materiales en Classroom y certificado de participación',
	estado: 'confirmado',
	publicado: true,
	requisitos: 'Se indican al contactar contigo según el curso.',
	herramientas:
		'Google Classroom y Google Meet. Hace falta internet, móvil u ordenador y cuenta Gmail.',
	asistencia: 'Se pide asistencia a las sesiones en directo. Las clases no se graban.',
	certificado:
		'Certificado o constancia de participación al completar el curso según las condiciones indicadas.',
	dirigido: 'Personas adultas interesadas en esta área formativa.',
	contenidos: [
		'Contenidos prácticos orientados a tu día a día',
		'Materiales de apoyo en Classroom',
		'Sesiones en aula virtual',
	],
}

/** Mismos nombres, slugs, textos y fotos que src/data/areas.ts (galería /cursos) */
const cursosWeb = [
	{
		slug: 'orientacion-profesional',
		nombre: 'Orientación profesional e inserción laboral',
		area: 'Orientación profesional e inserción laboral',
		aprender:
			'Desarrolla herramientas para buscar empleo, preparar candidaturas, conocer procesos de selección y mejorar tu presentación profesional.',
		foto: '/orientacion.jpg',
	},
	{
		slug: 'catalan-castellano',
		nombre: 'Catalán y castellano',
		area: 'Catalán y castellano',
		aprender:
			'Explora opciones formativas para reforzar la comunicación oral y escrita en situaciones cotidianas y profesionales.',
		foto: '/idiomas.jpg',
	},
	{
		slug: 'administracion-digital',
		nombre: 'Administración y herramientas digitales',
		area: 'Administración y herramientas digitales',
		aprender:
			'Acércate a competencias básicas de organización, gestión administrativa y uso de herramientas digitales.',
		foto: '/tecno.jpg',
	},
	{
		slug: 'comercio-atencion-cliente',
		nombre: 'Comercio y atención al cliente',
		area: 'Comercio y atención al cliente',
		aprender:
			'Conoce habilidades relacionadas con la atención al público, la comunicación comercial y las tareas habituales del sector.',
		foto: '/cliente.jpg',
	},
	{
		slug: 'hosteleria-turismo',
		nombre: 'Hostelería y turismo',
		area: 'Hostelería y turismo',
		aprender:
			'Descubre conocimientos prácticos relacionados con la atención a clientes, la organización del servicio y el trabajo en equipo.',
		foto: '/hosteliria.jpg',
	},
	{
		slug: 'sociedad-catalana',
		nombre: 'Sociedad catalana y entorno laboral',
		area: 'Sociedad catalana y entorno laboral',
		aprender:
			'Conoce aspectos de la vida cotidiana en Catalunya, los recursos del entorno y nociones generales sobre derechos y deberes laborales.',
		foto: '/sociedadcatalana.jpg',
	},
]

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
})

await pool.query('DELETE FROM cursos')

for (const c of cursosWeb) {
	await pool.query(
		`INSERT INTO cursos (
			slug, nombre, area, aprender, duracion, modalidad, idioma, incluye, foto,
			estado, publicado, dirigido, contenidos, requisitos, herramientas, asistencia, certificado
		) VALUES (
			$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
		)`,
		[
			c.slug,
			c.nombre,
			c.area,
			c.aprender,
			comunes.duracion,
			comunes.modalidad,
			comunes.idioma,
			comunes.incluye,
			c.foto,
			comunes.estado,
			comunes.publicado,
			comunes.dirigido,
			comunes.contenidos,
			comunes.requisitos,
			comunes.herramientas,
			comunes.asistencia,
			comunes.certificado,
		],
	)
}

const { rows } = await pool.query('SELECT nombre, publicado FROM cursos ORDER BY nombre')
console.log(
	'OK',
	rows.length,
	'cursos =',
	rows.map((r) => r.nombre).join(' | '),
)
await pool.end()
