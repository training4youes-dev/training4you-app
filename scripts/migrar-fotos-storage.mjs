/**
 * Crea el bucket "cursos" (si falta), sube las 6 fotos de public/ y actualiza la BD.
 * Requiere SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { createClient } from '@supabase/supabase-js'

const proyecto = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

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

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
	console.error('Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env')
	process.exit(1)
}

const BUCKET = 'cursos'
const mapa = [
	{ slug: 'orientacion-profesional', archivo: 'orientacion.jpg' },
	{ slug: 'catalan-castellano', archivo: 'idiomas.jpg' },
	{ slug: 'administracion-digital', archivo: 'tecno.jpg' },
	{ slug: 'comercio-atencion-cliente', archivo: 'cliente.jpg' },
	{ slug: 'hosteleria-turismo', archivo: 'hosteliria.jpg' },
	{ slug: 'sociedad-catalana', archivo: 'sociedadcatalana.jpg' },
]

const supabase = createClient(url, key, {
	auth: { persistSession: false, autoRefreshToken: false },
})

const { data: buckets } = await supabase.storage.listBuckets()
if (!buckets?.some((b) => b.name === BUCKET)) {
	const { error } = await supabase.storage.createBucket(BUCKET, {
		public: true,
		fileSizeLimit: 5 * 1024 * 1024,
		allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
	})
	if (error) {
		console.error('Bucket:', error.message)
		process.exit(1)
	}
	console.log('Bucket creado:', BUCKET)
} else {
	console.log('Bucket ya existe:', BUCKET)
}

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
})

for (const item of mapa) {
	const local = path.join(proyecto, 'public', item.archivo)
	if (!fs.existsSync(local)) {
		console.error('No existe', local)
		continue
	}
	const pathBucket = `${item.slug}/${item.archivo}`
	const bytes = fs.readFileSync(local)
	const { error } = await supabase.storage.from(BUCKET).upload(pathBucket, bytes, {
		contentType: 'image/jpeg',
		upsert: true,
	})
	if (error) {
		console.error(item.slug, error.message)
		continue
	}
	const { data } = supabase.storage.from(BUCKET).getPublicUrl(pathBucket)
	const publicUrl = data.publicUrl
	const { rowCount } = await pool.query(
		`UPDATE cursos SET foto = $2, actualizado_en = now() WHERE slug = $1`,
		[item.slug, publicUrl],
	)
	console.log(item.slug, '→', publicUrl, rowCount ? 'BD ok' : 'slug no encontrado')
}

await pool.end()
console.log('Listo')
