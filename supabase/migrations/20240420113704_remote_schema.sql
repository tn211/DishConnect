create sequence "public"."steps_step_number_seq";

alter table "public"."recipes" drop column "instructions";

alter table "public"."steps" alter column "step_number" set default nextval('steps_step_number_seq'::regclass);


