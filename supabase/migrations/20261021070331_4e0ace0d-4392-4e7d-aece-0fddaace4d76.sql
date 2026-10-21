alter table public.profiles add column if not exists interface_language text not null default 'en' check (interface_language in ('en', 'ru'));

comment on column public.profiles.interface_language is 'User-selected interface language: en or ru';