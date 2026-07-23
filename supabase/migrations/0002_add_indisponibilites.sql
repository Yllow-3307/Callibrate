-- Migration additive : ajout de la colonne indisponibilites a availability
-- et adaptation des colonnes equipment pour des structures de donnees structurees.

ALTER TABLE public.availability
  ADD COLUMN IF NOT EXISTS indisponibilites jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.equipment
  ALTER COLUMN details_perso TYPE jsonb
  USING CASE WHEN details_perso IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(details_perso) END;

ALTER TABLE public.equipment ALTER COLUMN details_perso SET DEFAULT '[]'::jsonb;

ALTER TABLE public.equipment
  ALTER COLUMN equipement_endurance TYPE jsonb
  USING CASE WHEN equipement_endurance IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(equipement_endurance) END;

ALTER TABLE public.equipment ALTER COLUMN equipement_endurance SET DEFAULT '[]'::jsonb;

ALTER TABLE public.equipment
  ALTER COLUMN type TYPE jsonb
  USING CASE WHEN type IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(type) END;

ALTER TABLE public.equipment ALTER COLUMN type SET DEFAULT '[]'::jsonb;
