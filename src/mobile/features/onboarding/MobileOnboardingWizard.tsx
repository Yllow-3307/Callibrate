import { motion, AnimatePresence } from 'framer-motion'
import {
  useOnboardingLogic,
  equipmentChoices,
  personalEquipmentOptions,
  enduranceOptions,
} from '../../../shared/hooks/useOnboardingLogic'
import { Button } from '../../../shared/components/Button'
import { ThemeToggle } from '../../../shared/components/ThemeToggle'

function MobileChoice({ value, checked, onChange, children }: { value: string; checked: boolean; onChange: () => void; children: string }) {
  return (
    <motion.label className="choice" data-checked={checked} layout whileTap={{ scale: 0.98 }} style={{ cursor: 'pointer' }}>
      <input type="checkbox" value={value} checked={checked} onChange={onChange} />
      <span style={{ flex: 1 }}>{children}</span>
      {checked && <span style={{ color: 'rgb(var(--color-accent-rgb))' }}>✓</span>}
    </motion.label>
  )
}

export default function MobileOnboardingWizard() {
  const {
    step, data, error, saving,
    set, next, prev, save,
    toggleEquipment, togglePersonalEquipment, toggleEndurance,
  } = useOnboardingLogic()

  return (
    <main className="wizard-page">
      <ThemeToggle />
      <motion.section className="glass-card wizard-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <h2>Personnalisation</h2>
        <p>Étape {step} / 5</p>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
            {step === 1 && (
              <div className="step">
                <h3>Parle-nous de toi</h3>
                <label>Âge<input type="number" min="12" value={data.age} onChange={(e) => set('age', e.target.value)} placeholder="25" /></label>
                <label>Sexe
                  <select value={data.sexe} onChange={(e) => set('sexe', e.target.value)}>
                    <option value="">Choisir…</option>
                    <option>Femme</option>
                    <option>Homme</option>
                    <option>Non précisé</option>
                  </select>
                </label>
                <label>Poids (kg)<input type="number" min="1" step="0.1" value={data.poids} onChange={(e) => set('poids', e.target.value)} placeholder="70" /></label>
                <label>Taille (cm)<input type="number" min="50" value={data.taille} onChange={(e) => set('taille', e.target.value)} placeholder="175" /></label>
                <label>Niveau en sport
                  <select value={data.niveauSport} onChange={(e) => set('niveauSport', e.target.value)}>
                    <option value="">Choisir…</option>
                    <option>Débutant</option>
                    <option>Intermédiaire</option>
                    <option>Avancé</option>
                    <option>Confirmé</option>
                  </select>
                </label>
              </div>
            )}
            {step === 2 && (
              <div className="step">
                <h3>Quel est ton objectif ?</h3>
                <div className="choice-list">
                  {['Sèche', 'Prise de muscle', 'Affinement musculaire sans prise de poids', 'Travail de figures de callisthénie'].map((item) => (
                    <MobileChoice key={item} value={item} checked={data.objectif === item} onChange={() => set('objectif', item)}>{item}</MobileChoice>
                  ))}
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="step">
                <h3>Ton équipement</h3>
                <p className="caption" style={{ marginTop: 0, marginBottom: 12, color: 'var(--color-text-muted)' }}>
                  Sélectionne tout ce à quoi tu as accès. Coche « Équipement personnel » pour préciser.
                </p>
                <div className="choice-list">
                  {equipmentChoices.map((item) => (
                    <MobileChoice key={item} value={item} checked={data.equipements.includes(item)} onChange={() => toggleEquipment(item)}>{item}</MobileChoice>
                  ))}
                </div>

                {data.equipements.includes('Équipement personnel') && (
                  <div className="wizard-subsection">
                    <h4>Précise ton équipement personnel</h4>
                    <div className="choice-list">
                      {personalEquipmentOptions.map((item) => (
                        <MobileChoice key={item} value={item} checked={data.detailsPerso.includes(item)} onChange={() => togglePersonalEquipment(item)}>{item}</MobileChoice>
                      ))}
                      <MobileChoice
                        value="__autre__"
                        checked={data.detailsPersoAutre.trim().length > 0}
                        onChange={() => {
                          if (data.detailsPersoAutre.trim().length === 0) set('detailsPersoAutre', 'Autre équipement')
                          else set('detailsPersoAutre', '')
                        }}
                      >
                        Autre
                      </MobileChoice>
                    </div>
                    {data.detailsPersoAutre.trim().length > 0 && (
                      <label className="wizard-other-input">
                        Précise « Autre »
                        <input
                          className="input-base"
                          type="text"
                          value={data.detailsPersoAutre}
                          onChange={(e) => set('detailsPersoAutre', e.target.value)}
                          placeholder="Ex. anneaux, sac de frappe…"
                        />
                      </label>
                    )}
                  </div>
                )}

                <div className="wizard-subsection">
                  <h4>Équipement d'endurance</h4>
                  <p className="caption" style={{ marginTop: 0, marginBottom: 12, color: 'var(--color-text-muted)' }}>
                    Sélectionne tout ce que tu utilises (ou pourrais utiliser) pour le cardio.
                  </p>
                  <div className="choice-list">
                    {enduranceOptions.map((item) => (
                      <MobileChoice key={item} value={item} checked={data.endurance.includes(item)} onChange={() => toggleEndurance(item)}>{item}</MobileChoice>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="step">
                <h3>Ton rythme de vie</h3>
                <label>Heure de réveil<input type="time" value={data.reveil} onChange={(e) => set('reveil', e.target.value)} /></label>
                <label>Début du travail<input type="time" value={data.travailDebut} onChange={(e) => set('travailDebut', e.target.value)} /></label>
                <label>Fin du travail<input type="time" value={data.travailFin} onChange={(e) => set('travailFin', e.target.value)} /></label>
                <label>Heure de coucher<input type="time" value={data.coucher} onChange={(e) => set('coucher', e.target.value)} /></label>
                <label>Préférence pour le sport
                  <select value={data.preferenceHoraire} onChange={(e) => set('preferenceHoraire', e.target.value)}>
                    <option>Matin</option>
                    <option>Soir</option>
                    <option>Variable selon les jours</option>
                  </select>
                </label>
                <label>Durée souhaitée (minutes)<input type="number" min="1" step="1" pattern="[0-9]*" inputMode="numeric" value={data.duree} onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); set('duree', v) }} placeholder="45" /></label>
                <label>Séances par semaine<input type="number" min="1" max="7" value={data.frequence} onChange={(e) => set('frequence', e.target.value)} placeholder="4" /></label>
              </div>
            )}
            {step === 5 && (
              <div className="step">
                <h3>Côté cuisine</h3>
                <label>Niveau en cuisine
                  <select value={data.niveauCuisine} onChange={(e) => set('niveauCuisine', e.target.value)}>
                    <option>Débutant</option>
                    <option>Intermédiaire</option>
                    <option>Avancé</option>
                    <option>Pro</option>
                  </select>
                </label>
                <label>Temps par repas (minutes)<input type="number" min="1" value={data.tempsCuisine} onChange={(e) => set('tempsCuisine', e.target.value)} placeholder="20" /></label>
                <label>Préférences alimentaires<textarea value={data.preferences} onChange={(e) => set('preferences', e.target.value)} placeholder="Ex. végétarien, sans porc…" /></label>
                <label>Allergies<textarea value={data.allergies} onChange={(e) => set('allergies', e.target.value)} placeholder="Indique-les si nécessaire" /></label>
                <label>Budget<input value={data.budget} onChange={(e) => set('budget', e.target.value)} placeholder="Ex. serré, moyen, flexible" /></label>
                <label>Petit-déjeuner
                  <select value={data.petitDejeuner} onChange={(e) => set('petitDejeuner', e.target.value)}>
                    <option>Maison</option>
                    <option>Cantine</option>
                    <option>Restaurant</option>
                  </select>
                </label>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && <p className="form-error">{error}</p>}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
          {step > 1 && <Button variant="secondary" onClick={prev}>Précédent</Button>}
          <Button variant={step === 5 ? 'warm' : 'primary'} onClick={step === 5 ? save : next} disabled={saving} isLoading={saving} size="lg">
            {saving ? 'Enregistrement…' : step === 5 ? 'Enregistrer mon profil' : 'Suivant'}
          </Button>
        </div>
      </motion.section>
    </main>
  )
}
