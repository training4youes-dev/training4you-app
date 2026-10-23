-- Estados de seguimiento en el admin: nueva | leida | contactada
alter table solicitudes
  add column if not exists estado text not null default 'nueva';
