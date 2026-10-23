-- Ampliar cursos para el panel admin (no borra solicitudes)
-- Supabase → SQL Editor → Run

alter table cursos
  add column if not exists area text,
  add column if not exists aprender text not null default '',
  add column if not exists duracion text not null default '',
  add column if not exists modalidad text not null default 'Aula virtual',
  add column if not exists idioma text not null default 'Castellano',
  add column if not exists incluye text not null default '',
  add column if not exists foto text not null default '/portada.jpg',
  add column if not exists estado text not null default 'confirmado',
  add column if not exists dirigido text not null default '',
  add column if not exists contenidos text[] not null default '{}',
  add column if not exists requisitos text not null default '',
  add column if not exists herramientas text not null default '',
  add column if not exists asistencia text not null default '',
  add column if not exists certificado text not null default '',
  add column if not exists actualizado_en timestamptz default now();

-- Quitar curso de prueba si sigue ahí
delete from cursos where slug = 'prueba';
