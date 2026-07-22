/** Types du moteur de regles Callibrate */
export type EquipmentType = 'Salle de sport' | 'Parc de street workout' | 'Équipement personnel' | 'Rien' | 'Poids du corps uniquement'
export type PersonalEquipment = 'Kettlebell' | 'Barre de traction' | 'Banc' | 'Haltères' | 'Élastique de résistance' | string
export type EnduranceEquipment = 'Course à pied' | 'Vélo' | 'Corde à sauter' | 'Rameur' | 'Piscine'
export type Indisponibilite = { debut: string; fin: string; label?: string }
export type UserProfile = { age: number; sexe: string; poids: number; taille: number; niveau_sport: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Confirmé'; objectif: string }
export type UserEquipment = { types: EquipmentType[]; details_perso: PersonalEquipment[]; equipement_endurance: EnduranceEquipment[] }
export type UserAvailability = { heure_reveil: string; heure_travail_debut: string; heure_travail_fin: string; heure_coucher: string; preference_horaire: 'Matin' | 'Soir' | 'Variable selon les jours'; duree_seance: number; frequence_semaine: number; indisponibilites: Indisponibilite[] }
export type Exercise = { id: string; nom: string; categorie: string; equipement_requis: string[]; niveau: string; muscle_cible: string }
export type TimeSlot = { jour: string; heure_debut: string; heure_fin: string; type: 'callisthenie' | 'endurance' }
