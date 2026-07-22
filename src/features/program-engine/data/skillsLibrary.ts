import type { SkillDefinition } from '../types'

/**
 * Bibliothèque de référence des figures (skills) de callisthénie.
 *
 * Chaque figure est testée par le moteur à intervalles réguliers
 * (objectif « Travail de figures de callisthénie »). Tout est stocké
 * dans la colonne jsonb `criteres_test` de la table skills, sans créer
 * de nouvelle colonne :
 *
 *   { niveau, description, prerequis: [...], test: { consigne, type, seuil, unite } }
 *
 * - `prerequis` : capacités à valider avant de travailler la figure.
 * - `test`     : critère simple et chronométrable (maintien en secondes
 *                ou nombre de répétitions).
 *
 * Les ids sont fixes et doivent rester synchronisés avec la migration
 * 0003_seed_skills.sql.
 */
export const skillsLibrary: SkillDefinition[] = [
  {
    id: 'f7691afe-e0c4-47d9-b66c-a31963feea2b',
    nom_figure: 'L-sit',
    criteres_test: {
      niveau: 'Intermédiaire',
      description: 'Tenir le corps en L, jambes tendues à l\'horizontale.',
      prerequis: ['Gainage planche 60 s', 'Dips entre deux appuis ×10'],
      test: { consigne: 'Tenir le L-sit 10 secondes sans poser les pieds', type: 'maintien', seuil: 10, unite: 's' },
    },
  },
  {
    id: '65a5c1f2-2e0c-45ce-bf02-6cd7b0aaa119',
    nom_figure: 'Planche (tuck planche)',
    criteres_test: {
      niveau: 'Avancé',
      description: 'Corps à l\'horizontale sur les bras, genoux serrés contre la poitrine.',
      prerequis: ['Pompes classiques ×20', 'Hollow body hold 20 s'],
      test: { consigne: 'Tenir la tuck planche 10 secondes', type: 'maintien', seuil: 10, unite: 's' },
    },
  },
  {
    id: '13c7adab-05b1-4c62-a7db-199b5a9f2a17',
    nom_figure: 'Planche complète',
    criteres_test: {
      niveau: 'Confirmé',
      description: 'Corps à l\'horizontale, jambes tendues, uniquement sur les bras.',
      prerequis: ['Tuck planche 20 s', 'Pompes pseudo-planche ×8'],
      test: { consigne: 'Tenir la planche complète 5 secondes', type: 'maintien', seuil: 5, unite: 's' },
    },
  },
  {
    id: 'fdfd1d96-669c-413f-8abf-b82a77b13f74',
    nom_figure: 'Front lever (tuck)',
    criteres_test: {
      niveau: 'Confirmé',
      description: 'Corps horizontal face au sol, suspendu à la barre, genoux serrés.',
      prerequis: ['Tractions pronation ×10', 'Relevés de jambes suspendu ×8'],
      test: { consigne: 'Tenir le tuck front lever 10 secondes', type: 'maintien', seuil: 10, unite: 's' },
    },
  },
  {
    id: '317dc5e1-5f26-4cc3-8ea9-26c74423c24e',
    nom_figure: 'Back lever (tuck)',
    criteres_test: {
      niveau: 'Avancé',
      description: 'Corps horizontal dos au sol, suspendu à la barre, genoux serrés.',
      prerequis: ['Tractions pronation ×8', 'Relevés de jambes suspendu ×10'],
      test: { consigne: 'Tenir le tuck back lever 10 secondes', type: 'maintien', seuil: 10, unite: 's' },
    },
  },
  {
    id: 'c991930c-ffaf-44c6-8f73-866ed46ed293',
    nom_figure: 'Muscle-up strict',
    criteres_test: {
      niveau: 'Confirmé',
      description: 'Passage au-dessus de la barre en un seul mouvement, sans élan.',
      prerequis: ['Tractions pronation ×12', 'Dips aux barres parallèles ×15'],
      test: { consigne: 'Réussir 1 muscle-up strict', type: 'repetitions', seuil: 1, unite: 'reps' },
    },
  },
  {
    id: '7488bd44-f61a-4bb4-8b39-ed2c25674ad8',
    nom_figure: 'Drapeau (human flag, tuck)',
    criteres_test: {
      niveau: 'Confirmé',
      description: 'Corps parallèle au sol sur une barre verticale, jambes repliées.',
      prerequis: ['Tractions pronation ×8', 'Gainage latéral 45 s de chaque côté'],
      test: { consigne: 'Tenir le drapeau tuck 5 secondes', type: 'maintien', seuil: 5, unite: 's' },
    },
  },
  {
    id: '518930ca-ef8b-4a2c-96ec-97da1a6fe3a9',
    nom_figure: 'Équilibre sur les mains (handstand)',
    criteres_test: {
      niveau: 'Avancé',
      description: 'Tenir l\'équilibre sur les mains, corps aligné.',
      prerequis: ['Pike push-ups ×10', 'Gainage planche 60 s'],
      test: { consigne: 'Tenir l\'équilibre sur les mains 10 secondes', type: 'maintien', seuil: 10, unite: 's' },
    },
  },
  {
    id: '1dcefd94-4ed4-4969-94fb-af997a0cf485',
    nom_figure: 'Pompes en poirier (HSPU)',
    criteres_test: {
      niveau: 'Avancé',
      description: 'Pompes en équilibre contre un mur, amplitude complète.',
      prerequis: ['Pike push-ups ×12'],
      test: { consigne: 'Enchaîner 3 pompes en poirier contre un mur', type: 'repetitions', seuil: 3, unite: 'reps' },
    },
  },
  {
    id: '59bd05f9-bcef-4cca-b3eb-66c7704a1b88',
    nom_figure: 'Pistol squat',
    criteres_test: {
      niveau: 'Avancé',
      description: 'Squat complet sur une jambe, l\'autre tendue devant.',
      prerequis: ['Squat bulgare ×10 par jambe', 'Pistol squat assisté ×5 par jambe'],
      test: { consigne: 'Enchaîner 3 pistol squats par jambe', type: 'repetitions', seuil: 3, unite: 'reps' },
    },
  },
  {
    id: '9877ca4f-b818-496d-bb39-e1b5aff17198',
    nom_figure: 'V-sit',
    criteres_test: {
      niveau: 'Confirmé',
      description: 'Comme le L-sit, mais jambes montées au-delà de l\'horizontale.',
      prerequis: ['L-sit 10 s', 'Relevés de jambes au sol ×15'],
      test: { consigne: 'Tenir le V-sit 10 secondes', type: 'maintien', seuil: 10, unite: 's' },
    },
  },
  {
    id: '89ed4d5a-0fbc-4996-a10d-5dc430a32d6c',
    nom_figure: 'Traction à un bras',
    criteres_test: {
      niveau: 'Confirmé',
      description: 'Traction complète avec un seul bras.',
      prerequis: ['Tractions archer ×5 de chaque côté', 'Tractions pronation ×15'],
      test: { consigne: 'Réussir 1 traction complète à un bras, sur le bras de ton choix', type: 'repetitions', seuil: 1, unite: 'reps' },
    },
  },
]
