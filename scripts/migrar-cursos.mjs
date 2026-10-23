import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const root = path.dirname(fileURLToPath(import.meta.url))
const proyecto = path.join(root, '..')

function cargarEnv() {
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
}

cargarEnv()

const cursosSeed = [
	{
		slug: 'catalan-inicial',
		nombre: 'Catalán inicial para el día a día',
		area: 'Idiomas',
		aprender: 'Comunicarte en situaciones cotidianas y ganar confianza en catalán.',
		duracion: '16 horas (4 sesiones de 4 h)',
		modalidad: 'Aula virtual',
		idioma: 'Castellano / Catalán',
		incluye: 'Clases en Meet, materiales en Classroom y certificado de participación',
		foto: '/portada.jpg',
		estado: 'confirmado',
		publicado: false,
		dirigido: 'Personas adultas que quieren empezar a hablar catalán en el día a día.',
		contenidos: [
			'Saludos y presentaciones',
			'Compras y gestiones básicas',
			'Frases útiles en el trabajo y en el barrio',
			'Práctica oral en cada sesión',
		],
		requisitos: 'No se exige nivel previo. Se recomienda comprensión básica de castellano.',
		herramientas:
			'Google Classroom y Google Meet. Hace falta internet, móvil u ordenador y cuenta Gmail.',
		asistencia: 'Se pide asistencia a las sesiones en directo. Las clases no se graban.',
		certificado:
			'Certificado o constancia de participación al completar el curso según las condiciones indicadas.',
	},
	{
		slug: 'insercion-laboral',
		nombre: 'Inserción laboral y búsqueda de empleo',
		area: 'Inserción laboral',
		aprender: 'Preparar CV, entrevistas y buscar trabajo con más seguridad.',
		duracion: '16 horas (4 sesiones de 4 h)',
		modalidad: 'Aula virtual',
		idioma: 'Castellano',
		incluye: 'Clases en Meet, materiales en Classroom y certificado de participación',
		foto: '/matricula.jpg',
		estado: 'confirmado',
		publicado: false,
		dirigido: 'Personas que buscan empleo o quieren mejorar su candidatura.',
		contenidos: [
			'CV y carta de presentación',
			'Buscar ofertas con método',
			'Entrevistas de trabajo',
			'Recursos de empleo en Catalunya',
		],
		requisitos: 'Nivel básico de castellano hablado y escrito.',
		herramientas:
			'Google Classroom y Google Meet. Hace falta internet, móvil u ordenador y cuenta Gmail.',
		asistencia: 'Se pide asistencia a las sesiones en directo. Las clases no se graban.',
		certificado:
			'Certificado o constancia de participación al completar el curso según las condiciones indicadas.',
	},
	{
		slug: 'administracion-gestion',
		nombre: 'Administración y gestión',
		area: 'Administración y gestión',
		aprender: 'Organizar tareas administrativas básicas y usar herramientas digitales sencillas.',
		duracion: '16 horas (4 sesiones de 4 h)',
		modalidad: 'Aula virtual',
		idioma: 'Castellano',
		incluye: 'Clases en Meet, materiales en Classroom y certificado de participación',
		foto: '/portada.jpg',
		estado: 'confirmado',
		publicado: false,
		dirigido: 'Personas que quieren reforzar competencias administrativas básicas.',
		contenidos: [
			'Organización de documentos',
			'Comunicación profesional por email',
			'Hojas de cálculo básicas',
			'Atención al cliente por escrito',
		],
		requisitos: 'Manejo básico de móvil u ordenador.',
		herramientas:
			'Google Classroom y Google Meet. Hace falta internet, móvil u ordenador y cuenta Gmail.',
		asistencia: 'Se pide asistencia a las sesiones en directo. Las clases no se graban.',
		certificado:
			'Certificado o constancia de participación al completar el curso según las condiciones indicadas.',
	},
	{
		slug: 'hosteleria-turismo',
		nombre: 'Hostelería y turismo',
		area: 'Hostelería y turismo',
		aprender: 'Atención al cliente y vocabulario útil en hostelería.',
		duracion: '16 horas (4 sesiones de 4 h)',
		modalidad: 'Aula virtual',
		idioma: 'Castellano',
		incluye: 'Clases en Meet, materiales en Classroom y certificado de participación',
		foto: '/matricula.jpg',
		estado: 'confirmado',
		publicado: false,
		dirigido: 'Personas interesadas en trabajar o mejorar en hostelería y turismo.',
		contenidos: [
			'Recepción y atención al cliente',
			'Reservas y quejas básicas',
			'Trabajo en equipo',
			'Buenas prácticas de servicio',
		],
		requisitos: 'Nivel básico de castellano.',
		herramientas:
			'Google Classroom y Google Meet. Hace falta internet, móvil u ordenador y cuenta Gmail.',
		asistencia: 'Se pide asistencia a las sesiones en directo. Las clases no se graban.',
		certificado:
			'Certificado o constancia de participación al completar el curso según las condiciones indicadas.',
	},
	{
		slug: 'comercio-atencion-cliente',
		nombre: 'Comercio y atención al cliente',
		area: 'Comercio y marketing',
		aprender: 'Atender clientes con claridad y resolver situaciones habituales de venta.',
		duracion: '16 horas (4 sesiones de 4 h)',
		modalidad: 'Aula virtual',
		idioma: 'Castellano',
		incluye: 'Clases en Meet, materiales en Classroom y certificado de participación',
		foto: '/portada.jpg',
		estado: 'confirmado',
		publicado: false,
		dirigido: 'Personas que trabajan o quieren trabajar en comercio y atención al cliente.',
		contenidos: [
			'Primer contacto con el cliente',
			'Técnicas básicas de venta',
			'Gestión de quejas',
			'Imagen profesional',
		],
		requisitos: 'Nivel básico de castellano.',
		herramientas:
			'Google Classroom y Google Meet. Hace falta internet, móvil u ordenador y cuenta Gmail.',
		asistencia: 'Se pide asistencia a las sesiones en directo. Las clases no se graban.',
		certificado:
			'Certificado o constancia de participación al completar el curso según las condiciones indicadas.',
	},
	{
		slug: 'sociedad-catalana',
		nombre: 'Sociedad catalana y convivencia',
		area: 'Sociedad catalana',
		aprender: 'Conocer Catalunya, derechos básicos y recursos útiles.',
		duracion: '16 horas (4 sesiones de 4 h)',
		modalidad: 'Aula virtual',
		idioma: 'Castellano',
		incluye: 'Clases en Meet, materiales en Classroom y certificado de participación',
		foto: '/matricula.jpg',
		estado: 'confirmado',
		publicado: false,
		dirigido: 'Personas que quieren conocer mejor el entorno social y administrativo en Catalunya.',
		contenidos: [
			'Instituciones y recursos locales',
			'Derechos y deberes básicos',
			'Convivencia y participación',
			'Orientación práctica para el día a día',
		],
		requisitos: 'Nivel básico de castellano.',
		herramientas:
			'Google Classroom y Google Meet. Hace falta internet, móvil u ordenador y cuenta Gmail.',
		asistencia: 'Se pide asistencia a las sesiones en directo. Las clases no se graban.',
		certificado:
			'Certificado o constancia de participación al completar el curso según las condiciones indicadas.',
	},
]

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
})

const migracion = fs.readFileSync(path.join(proyecto, 'sql', 'migrate-cursos-admin.sql'), 'utf8')

await pool.query(migracion)

for (const c of cursosSeed) {
	await pool.query(
		`INSERT INTO cursos (
			slug, nombre, area, aprender, duracion, modalidad, idioma, incluye, foto,
			estado, publicado, dirigido, contenidos, requisitos, herramientas, asistencia, certificado
		) VALUES (
			$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
		)
		ON CONFLICT (slug) DO UPDATE SET
			nombre = EXCLUDED.nombre,
			area = EXCLUDED.area,
			aprender = EXCLUDED.aprender,
			duracion = EXCLUDED.duracion,
			modalidad = EXCLUDED.modalidad,
			idioma = EXCLUDED.idioma,
			incluye = EXCLUDED.incluye,
			foto = EXCLUDED.foto,
			estado = EXCLUDED.estado,
			publicado = EXCLUDED.publicado,
			dirigido = EXCLUDED.dirigido,
			contenidos = EXCLUDED.contenidos,
			requisitos = EXCLUDED.requisitos,
			herramientas = EXCLUDED.herramientas,
			asistencia = EXCLUDED.asistencia,
			certificado = EXCLUDED.certificado,
			actualizado_en = now()`,
		[
			c.slug,
			c.nombre,
			c.area,
			c.aprender,
			c.duracion,
			c.modalidad,
			c.idioma,
			c.incluye,
			c.foto,
			c.estado,
			c.publicado,
			c.dirigido,
			c.contenidos,
			c.requisitos,
			c.herramientas,
			c.asistencia,
			c.certificado,
		],
	)
}

const { rows } = await pool.query('SELECT count(*)::int AS n FROM cursos')
console.log('Cursos en BD:', rows[0].n)
await pool.end()
