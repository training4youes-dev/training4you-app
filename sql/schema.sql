-- Training 4 You — schema limpio (captación)
-- Pegar en Supabase → SQL Editor → Run
-- Si ya existen tablas viejas, usa antes sql/reset.sql

create table if not exists areas (
  id serial primary key,
  nombre text not null,
  slug text unique not null
);

create table if not exists cursos (
  id serial primary key,
  slug text unique not null,
  nombre text not null,
  area text,
  aprender text not null default '',
  duracion text not null default '',
  modalidad text not null default 'Aula virtual',
  idioma text not null default 'Castellano',
  incluye text not null default '',
  foto text not null default '/portada.jpg',
  estado text not null default 'confirmado',
  publicado boolean default false,
  dirigido text not null default '',
  contenidos text[] not null default '{}',
  requisitos text not null default '',
  herramientas text not null default '',
  asistencia text not null default '',
  certificado text not null default '',
  actualizado_en timestamptz default now()
);

create table if not exists solicitudes (
  id serial primary key,
  nombre text not null,
  apellidos text not null,
  email text not null,
  whatsapp text,
  motivo text,
  curso_slug text,
  area text,
  mensaje text,
  estado text not null default 'nueva',
  creado_en timestamptz default now()
);
