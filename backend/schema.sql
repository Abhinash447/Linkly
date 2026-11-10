-- Fresh Neon/PostgreSQL schema for Linkly.
-- Apply this file to an empty database using the Neon SQL Editor.

CREATE SEQUENCE public.users_id_seq AS integer;
CREATE SEQUENCE public.urls_id_seq AS integer;
CREATE SEQUENCE public.click_events_id_seq AS integer;

CREATE TABLE public.users (
  email varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  id integer NOT NULL DEFAULT nextval('public.users_id_seq'::regclass),
  CONSTRAINT users_email_key UNIQUE (email)
);

CREATE UNIQUE INDEX users_id_uidx ON public.users (id);

CREATE TABLE public.short_urls (
  id integer NOT NULL DEFAULT nextval('public.urls_id_seq'::regclass),
  original_url varchar,
  short_code varchar,
  created_at date,
  clicks_count integer NOT NULL DEFAULT 0,
  user_id integer,
  CONSTRAINT urls_pkey PRIMARY KEY (id),
  CONSTRAINT constraint_name UNIQUE (short_code),
  CONSTRAINT short_urls_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE SET NULL
);

CREATE INDEX short_urls_user_id_idx ON public.short_urls (user_id);

CREATE TABLE public.click_events (
  id integer NOT NULL DEFAULT nextval('public.click_events_id_seq'::regclass),
  short_url_id integer,
  clicked_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  country varchar(2),
  CONSTRAINT click_events_pkey PRIMARY KEY (id),
  CONSTRAINT click_events_short_url_id_fkey
    FOREIGN KEY (short_url_id)
    REFERENCES public.short_urls (id)
    ON DELETE CASCADE
);

CREATE TABLE public.schema_migrations (
  filename text NOT NULL,
  applied_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT schema_migrations_pkey PRIMARY KEY (filename)
);

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
ALTER SEQUENCE public.urls_id_seq OWNED BY public.short_urls.id;
ALTER SEQUENCE public.click_events_id_seq OWNED BY public.click_events.id;

-- This schema already includes migration 001's owner column and index.
INSERT INTO public.schema_migrations (filename)
VALUES ('001_add_short_url_owner.sql')
ON CONFLICT (filename) DO NOTHING;
