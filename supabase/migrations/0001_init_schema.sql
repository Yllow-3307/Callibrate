-- Schéma initial Callibrate. Les tables de référence sont globales.

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  age integer,
  sexe text,
  poids numeric,
  taille numeric,
  niveau_sport text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type_objectif text,
  date_creation date,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text,
  details_perso text,
  equipement_endurance text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  heure_reveil time,
  heure_travail_debut time,
  heure_travail_fin time,
  heure_coucher time,
  preference_horaire text,
  duree_seance integer,
  frequence_semaine integer,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.cooking_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  niveau_cuisine text,
  temps_dispo integer,
  preferences text,
  allergies text,
  budget text,
  lieu_repas jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version integer,
  statut text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.program_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  ordre integer,
  nom_phase text,
  criteres_progression jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.exercises_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text,
  categorie text,
  equipement_requis text,
  niveau text,
  muscle_cible text
);

CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  phase_id uuid REFERENCES public.program_phases(id) ON DELETE SET NULL,
  date_prevue date,
  type text CHECK (type IN ('callisthenie', 'endurance')),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.session_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises_library(id),
  series integer,
  reps text,
  temps_repos integer,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.session_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  realise_le timestamp with time zone,
  ressenti text,
  donnees_reelles jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.nutrition_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  macros_cibles jsonb,
  hydratation_cible integer,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.nutrition_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date,
  repas text,
  macros_calculees jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.favorite_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom text,
  macros jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredients jsonb,
  etapes jsonb,
  macros jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.hydration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date,
  quantite integer,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date,
  poids numeric,
  mensurations jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_figure text,
  criteres_test jsonb
);

CREATE TABLE public.skill_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id),
  date date,
  resultat jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom text,
  url text,
  type_seance_associe text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.notion_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  token text,
  database_id text,
  created_at timestamp with time zone DEFAULT now()
);

-- Chaque utilisateur authentifié ne peut accéder qu'à ses propres données.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooking_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notion_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_profiles" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_manage_own_goals" ON public.goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_manage_own_equipment" ON public.equipment FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_manage_own_availability" ON public.availability FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_manage_own_cooking_preferences" ON public.cooking_preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_manage_own_programs" ON public.programs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_manage_own_nutrition_targets" ON public.nutrition_targets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_manage_own_nutrition_logs" ON public.nutrition_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_manage_own_favorite_meals" ON public.favorite_meals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_manage_own_recipes" ON public.recipes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_manage_own_hydration_logs" ON public.hydration_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_manage_own_measurements" ON public.measurements FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_manage_own_skill_tests" ON public.skill_tests FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_manage_own_playlists" ON public.playlists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_manage_own_notion_connections" ON public.notion_connections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Les référentiels sont consultables par les utilisateurs authentifiés uniquement.
ALTER TABLE public.exercises_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_read_exercises_library" ON public.exercises_library FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_skills" ON public.skills FOR SELECT TO authenticated USING (true);
