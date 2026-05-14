
  create table "public"."nodes" (
    "id" uuid not null default gen_random_uuid(),
    "opening_id" uuid not null,
    "parent_id" uuid,
    "move_san" text,
    "move_uci" text,
    "fen" text not null,
    "annotation" text,
    "sort_order" integer not null default 0,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."nodes" enable row level security;


  create table "public"."openings" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "color" text not null,
    "description" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."openings" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "display_name" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."profiles" enable row level security;


  create table "public"."review_cards" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "node_id" uuid not null,
    "interval" integer not null default 1,
    "ease_factor" numeric(4,2) not null default 2.5,
    "repetitions" integer not null default 0,
    "due_date" date not null default CURRENT_DATE,
    "last_reviewed" timestamp with time zone
      );


alter table "public"."review_cards" enable row level security;

CREATE INDEX idx_nodes_fen ON public.nodes USING btree (fen);

CREATE INDEX idx_nodes_opening ON public.nodes USING btree (opening_id);

CREATE INDEX idx_nodes_parent ON public.nodes USING btree (parent_id);

CREATE INDEX idx_review_cards_due ON public.review_cards USING btree (user_id, due_date);

CREATE UNIQUE INDEX nodes_pkey ON public.nodes USING btree (id);

CREATE UNIQUE INDEX openings_pkey ON public.openings USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX review_cards_pkey ON public.review_cards USING btree (id);

CREATE UNIQUE INDEX review_cards_user_id_node_id_key ON public.review_cards USING btree (user_id, node_id);

alter table "public"."nodes" add constraint "nodes_pkey" PRIMARY KEY using index "nodes_pkey";

alter table "public"."openings" add constraint "openings_pkey" PRIMARY KEY using index "openings_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."review_cards" add constraint "review_cards_pkey" PRIMARY KEY using index "review_cards_pkey";

alter table "public"."nodes" add constraint "nodes_opening_id_fkey" FOREIGN KEY (opening_id) REFERENCES public.openings(id) ON DELETE CASCADE not valid;

alter table "public"."nodes" validate constraint "nodes_opening_id_fkey";

alter table "public"."nodes" add constraint "nodes_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.nodes(id) ON DELETE CASCADE not valid;

alter table "public"."nodes" validate constraint "nodes_parent_id_fkey";

alter table "public"."openings" add constraint "openings_color_check" CHECK ((color = ANY (ARRAY['white'::text, 'black'::text]))) not valid;

alter table "public"."openings" validate constraint "openings_color_check";

alter table "public"."openings" add constraint "openings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."openings" validate constraint "openings_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."review_cards" add constraint "review_cards_node_id_fkey" FOREIGN KEY (node_id) REFERENCES public.nodes(id) ON DELETE CASCADE not valid;

alter table "public"."review_cards" validate constraint "review_cards_node_id_fkey";

alter table "public"."review_cards" add constraint "review_cards_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."review_cards" validate constraint "review_cards_user_id_fkey";

alter table "public"."review_cards" add constraint "review_cards_user_id_node_id_key" UNIQUE using index "review_cards_user_id_node_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name'
  );
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."nodes" to "anon";

grant insert on table "public"."nodes" to "anon";

grant references on table "public"."nodes" to "anon";

grant select on table "public"."nodes" to "anon";

grant trigger on table "public"."nodes" to "anon";

grant truncate on table "public"."nodes" to "anon";

grant update on table "public"."nodes" to "anon";

grant delete on table "public"."nodes" to "authenticated";

grant insert on table "public"."nodes" to "authenticated";

grant references on table "public"."nodes" to "authenticated";

grant select on table "public"."nodes" to "authenticated";

grant trigger on table "public"."nodes" to "authenticated";

grant truncate on table "public"."nodes" to "authenticated";

grant update on table "public"."nodes" to "authenticated";

grant delete on table "public"."nodes" to "service_role";

grant insert on table "public"."nodes" to "service_role";

grant references on table "public"."nodes" to "service_role";

grant select on table "public"."nodes" to "service_role";

grant trigger on table "public"."nodes" to "service_role";

grant truncate on table "public"."nodes" to "service_role";

grant update on table "public"."nodes" to "service_role";

grant delete on table "public"."openings" to "anon";

grant insert on table "public"."openings" to "anon";

grant references on table "public"."openings" to "anon";

grant select on table "public"."openings" to "anon";

grant trigger on table "public"."openings" to "anon";

grant truncate on table "public"."openings" to "anon";

grant update on table "public"."openings" to "anon";

grant delete on table "public"."openings" to "authenticated";

grant insert on table "public"."openings" to "authenticated";

grant references on table "public"."openings" to "authenticated";

grant select on table "public"."openings" to "authenticated";

grant trigger on table "public"."openings" to "authenticated";

grant truncate on table "public"."openings" to "authenticated";

grant update on table "public"."openings" to "authenticated";

grant delete on table "public"."openings" to "service_role";

grant insert on table "public"."openings" to "service_role";

grant references on table "public"."openings" to "service_role";

grant select on table "public"."openings" to "service_role";

grant trigger on table "public"."openings" to "service_role";

grant truncate on table "public"."openings" to "service_role";

grant update on table "public"."openings" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."review_cards" to "anon";

grant insert on table "public"."review_cards" to "anon";

grant references on table "public"."review_cards" to "anon";

grant select on table "public"."review_cards" to "anon";

grant trigger on table "public"."review_cards" to "anon";

grant truncate on table "public"."review_cards" to "anon";

grant update on table "public"."review_cards" to "anon";

grant delete on table "public"."review_cards" to "authenticated";

grant insert on table "public"."review_cards" to "authenticated";

grant references on table "public"."review_cards" to "authenticated";

grant select on table "public"."review_cards" to "authenticated";

grant trigger on table "public"."review_cards" to "authenticated";

grant truncate on table "public"."review_cards" to "authenticated";

grant update on table "public"."review_cards" to "authenticated";

grant delete on table "public"."review_cards" to "service_role";

grant insert on table "public"."review_cards" to "service_role";

grant references on table "public"."review_cards" to "service_role";

grant select on table "public"."review_cards" to "service_role";

grant trigger on table "public"."review_cards" to "service_role";

grant truncate on table "public"."review_cards" to "service_role";

grant update on table "public"."review_cards" to "service_role";


  create policy "nodes_delete"
  on "public"."nodes"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.openings
  WHERE ((openings.id = nodes.opening_id) AND (openings.user_id = auth.uid())))));



  create policy "nodes_insert"
  on "public"."nodes"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.openings
  WHERE ((openings.id = nodes.opening_id) AND (openings.user_id = auth.uid())))));



  create policy "nodes_select"
  on "public"."nodes"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.openings
  WHERE ((openings.id = nodes.opening_id) AND (openings.user_id = auth.uid())))));



  create policy "nodes_update"
  on "public"."nodes"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.openings
  WHERE ((openings.id = nodes.opening_id) AND (openings.user_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM public.openings
  WHERE ((openings.id = nodes.opening_id) AND (openings.user_id = auth.uid())))));



  create policy "openings_delete"
  on "public"."openings"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "openings_insert"
  on "public"."openings"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "openings_select"
  on "public"."openings"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "openings_update"
  on "public"."openings"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "profiles_select"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((auth.uid() = id));



  create policy "profiles_update"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id))
with check ((auth.uid() = id));



  create policy "review_cards_delete"
  on "public"."review_cards"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "review_cards_insert"
  on "public"."review_cards"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "review_cards_select"
  on "public"."review_cards"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "review_cards_update"
  on "public"."review_cards"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


