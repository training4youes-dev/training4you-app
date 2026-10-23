import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'

export const BUCKET_CURSOS = 'cursos'

const TIPOS_OK = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES = 5 * 1024 * 1024

function limpiarValor(valor: string) {
	const limpio = valor.trim()
	if (
		(limpio.startsWith('"') && limpio.endsWith('"')) ||
		(limpio.startsWith("'") && limpio.endsWith("'"))
	) {
		return limpio.slice(1, -1)
	}
	return limpio
}

function leerEnv(nombre: string) {
	const desdeProceso = process.env[nombre]
	if (desdeProceso) return limpiarValor(desdeProceso)

	const desdeImport = import.meta.env[nombre]
	if (typeof desdeImport === 'string' && desdeImport) {
		return limpiarValor(desdeImport)
	}

	try {
		const texto = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8')
		for (const linea of texto.split(/\r?\n/)) {
			const limpia = linea.trim()
			if (!limpia || limpia.startsWith('#')) continue
			const sep = limpia.indexOf('=')
			if (sep === -1) continue
			if (limpia.slice(0, sep).trim() !== nombre) continue
			return limpiarValor(limpia.slice(sep + 1))
		}
	} catch {
		/* sin .env local */
	}
	return ''
}

function supabaseAdmin(): SupabaseClient {
	const url = leerEnv('SUPABASE_URL')
	const key = leerEnv('SUPABASE_SERVICE_ROLE_KEY')
	if (!url || !key) {
		throw new Error(
			'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env (Supabase → Settings → API)',
		)
	}
	return createClient(url, key, {
		auth: { persistSession: false, autoRefreshToken: false },
	})
}

export function storageConfigurado() {
	return Boolean(leerEnv('SUPABASE_URL') && leerEnv('SUPABASE_SERVICE_ROLE_KEY'))
}

function extensionDe(archivo: File) {
	const porNombre = archivo.name.split('.').pop()?.toLowerCase()
	if (porNombre && /^[a-z0-9]+$/.test(porNombre)) return porNombre
	if (archivo.type === 'image/png') return 'png'
	if (archivo.type === 'image/webp') return 'webp'
	if (archivo.type === 'image/gif') return 'gif'
	return 'jpg'
}

export async function asegurarBucketCursos() {
	const supabase = supabaseAdmin()
	const { data: buckets } = await supabase.storage.listBuckets()
	const existe = buckets?.some((b) => b.name === BUCKET_CURSOS)
	if (existe) return

	const { error } = await supabase.storage.createBucket(BUCKET_CURSOS, {
		public: true,
		fileSizeLimit: MAX_BYTES,
		allowedMimeTypes: [...TIPOS_OK],
	})
	if (error && !/already exists/i.test(error.message)) {
		throw new Error(`No se pudo crear el bucket: ${error.message}`)
	}
}

export async function subirFotoCurso(archivo: File, slug: string) {
	if (!TIPOS_OK.has(archivo.type) && archivo.type !== '') {
		throw new Error('Solo se admiten imágenes JPG, PNG, WebP o GIF')
	}
	if (archivo.size <= 0) throw new Error('El archivo de foto está vacío')
	if (archivo.size > MAX_BYTES) throw new Error('La foto no puede superar 5 MB')

	await asegurarBucketCursos()

	const pathArchivo = `${slug}/${Date.now()}.${extensionDe(archivo)}`
	const bytes = new Uint8Array(await archivo.arrayBuffer())
	const supabase = supabaseAdmin()

	const { error } = await supabase.storage.from(BUCKET_CURSOS).upload(pathArchivo, bytes, {
		contentType: archivo.type || 'image/jpeg',
		upsert: false,
	})
	if (error) throw new Error(error.message)

	const { data } = supabase.storage.from(BUCKET_CURSOS).getPublicUrl(pathArchivo)
	return data.publicUrl
}

export async function subirFotoDesdeDisco(rutaLocal: string, pathEnBucket: string) {
	await asegurarBucketCursos()
	const bytes = fs.readFileSync(rutaLocal)
	const ext = path.extname(rutaLocal).toLowerCase()
	const contentType =
		ext === '.png'
			? 'image/png'
			: ext === '.webp'
				? 'image/webp'
				: ext === '.gif'
					? 'image/gif'
					: 'image/jpeg'

	const supabase = supabaseAdmin()
	const { error } = await supabase.storage.from(BUCKET_CURSOS).upload(pathEnBucket, bytes, {
		contentType,
		upsert: true,
	})
	if (error) throw new Error(error.message)

	const { data } = supabase.storage.from(BUCKET_CURSOS).getPublicUrl(pathEnBucket)
	return data.publicUrl
}

export function esUrlStorageCursos(url: string) {
	return url.includes(`/object/public/${BUCKET_CURSOS}/`)
}

export async function borrarFotoStorage(url: string) {
	if (!esUrlStorageCursos(url)) return
	const marca = `/object/public/${BUCKET_CURSOS}/`
	const i = url.indexOf(marca)
	if (i === -1) return
	const pathArchivo = decodeURIComponent(url.slice(i + marca.length).split('?')[0])
	if (!pathArchivo) return
	await supabaseAdmin().storage.from(BUCKET_CURSOS).remove([pathArchivo])
}

/** Aplica subida / borrado de foto según el formulario multipart. */
export async function resolverFotoCurso(
	datos: FormData,
	slug: string,
	fotoActual: string,
): Promise<string> {
	const borrar = datos.get('borrar_foto') === 'on'
	const archivo = datos.get('foto_archivo')

	if (borrar) {
		if (fotoActual) await borrarFotoStorage(fotoActual)
		return '/portada.jpg'
	}

	if (archivo instanceof File && archivo.size > 0) {
		const nueva = await subirFotoCurso(archivo, slug)
		if (fotoActual && esUrlStorageCursos(fotoActual)) {
			await borrarFotoStorage(fotoActual)
		}
		return nueva
	}

	return fotoActual || '/portada.jpg'
}
