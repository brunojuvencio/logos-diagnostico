-- ============================================================
-- LOGOS DIAGNOSTICO - Migration 002: Eventos do funil
-- Execute no Supabase: Dashboard -> SQL Editor -> New Query
-- ============================================================

create table if not exists funil_eventos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text not null,
  event_type text not null check (event_type in ('step_view', 'step_continue', 'submit')),
  step_number integer not null check (step_number between 0 and 4),
  step_name text not null,
  form_name text,
  page_url text,
  referrer text,
  user_agent text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  event_id text
);

create index if not exists funil_eventos_created_at_idx on funil_eventos (created_at desc);
create index if not exists funil_eventos_session_id_idx on funil_eventos (session_id);
create index if not exists funil_eventos_event_type_idx on funil_eventos (event_type);
create index if not exists funil_eventos_step_number_idx on funil_eventos (step_number);
create index if not exists funil_eventos_utm_campaign_idx on funil_eventos (utm_campaign);

-- Verificacao:
-- select step_number, step_name, event_type, count(*)
-- from funil_eventos
-- group by 1, 2, 3
-- order by 1, 3;
