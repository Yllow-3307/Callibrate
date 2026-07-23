/**
 * Test d'intégration pour le bug 2 : parcours d'onboarding avec les
 * sous-sélections équipement personnel et endurance.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

const mockSignInWithPassword = vi.fn()
const mockGetSession = vi.fn()
const mockOnAuthStateChange = vi.fn()
const mockFrom = vi.fn()

vi.mock('../shared/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      getSession: (...args: unknown[]) => mockGetSession(...args),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}))

import { useAuthStore } from '../shared/store/authStore'
import MobileOnboardingWizard from '../mobile/features/onboarding/MobileOnboardingWizard'

afterEach(() => { cleanup() })

beforeEach(() => {
  mockFrom.mockReset()
  mockGetSession.mockResolvedValue({ data: { session: null } })
  mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
  // Make all writes resolve successfully
  mockFrom.mockImplementation(() => ({
    upsert: () => Promise.resolve({ data: null, error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
  }))
  const fakeUser = { id: 'u1', email: 'a@b.c', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '2026-01-01' } as any
  useAuthStore.setState({ user: fakeUser, loading: false })
})

describe('A2 — sous-sélections étape 3 équipement', () => {
  it('affiche les 5 choix principaux d\'équipement', async () => {
    function Demo() {
      return (
        <MemoryRouter initialEntries={['/onboarding']}>
          <Routes>
            <Route path="/onboarding" element={<MobileOnboardingWizard />} />
            <Route path="/merci" element={<div>MERCI</div>} />
            <Route path="*" element={<div>FALLBACK</div>} />
          </Routes>
        </MemoryRouter>
      )
    }
    render(<Demo />)
    // Avance jusqu'à l'étape 3
    await waitFor(() => expect(screen.getByPlaceholderText('25')).toBeTruthy())
    fireEvent.change(screen.getByPlaceholderText('25'), { target: { value: '25' } })
    fireEvent.change(screen.getByRole('combobox', { name: /sexe/i }), { target: { value: 'Homme' } })
    fireEvent.change(screen.getByPlaceholderText('70'), { target: { value: '70' } })
    fireEvent.change(screen.getByPlaceholderText('175'), { target: { value: '175' } })
    fireEvent.change(screen.getByRole('combobox', { name: /niveau en sport/i }), { target: { value: 'Intermédiaire' } })
    fireEvent.click(screen.getByRole('button', { name: /^suivant$/i }))

    // Étape 2
    await waitFor(() => expect(screen.getByText('Sèche')).toBeTruthy())
    fireEvent.click(screen.getByText('Sèche'))
    fireEvent.click(screen.getByRole('button', { name: /^suivant$/i }))

    // Étape 3
    await waitFor(() => expect(screen.getByText("Ton équipement")).toBeTruthy())
    // Les 5 choix principaux sont affichés
    expect(screen.getByText('Salle de sport')).toBeTruthy()
    expect(screen.getByText('Parc de street workout')).toBeTruthy()
    expect(screen.getByText('Équipement personnel')).toBeTruthy()
    expect(screen.getByText('Rien')).toBeTruthy()
    expect(screen.getByText('Poids du corps uniquement')).toBeTruthy()
    // Endurance est toujours visible (pas conditionnel)
    expect(screen.getByText('Équipement d\'endurance')).toBeTruthy()
    expect(screen.getByText('Course à pied')).toBeTruthy()
    expect(screen.getByText('Vélo')).toBeTruthy()
    expect(screen.getByText('Piscine')).toBeTruthy()
    expect(screen.getByText('Rameur')).toBeTruthy()
    expect(screen.getByText('Corde à sauter')).toBeTruthy()
  })

  it('affiche la sous-sélection équipement personnel quand on coche "Équipement personnel"', async () => {
    function Demo() {
      return (
        <MemoryRouter initialEntries={['/onboarding']}>
          <Routes>
            <Route path="/onboarding" element={<MobileOnboardingWizard />} />
            <Route path="/merci" element={<div>MERCI</div>} />
            <Route path="*" element={<div>FALLBACK</div>} />
          </Routes>
        </MemoryRouter>
      )
    }
    render(<Demo />)
    // Étape 1
    const ageInput = await screen.findByPlaceholderText('25', {}, { timeout: 3000 })
    fireEvent.change(ageInput, { target: { value: '25' } })
    fireEvent.change(screen.getByRole('combobox', { name: /sexe/i }), { target: { value: 'Homme' } })
    fireEvent.change(screen.getByPlaceholderText('70'), { target: { value: '70' } })
    fireEvent.change(screen.getByPlaceholderText('175'), { target: { value: '175' } })
    fireEvent.change(screen.getByRole('combobox', { name: /niveau en sport/i }), { target: { value: 'Intermédiaire' } })
    fireEvent.click(screen.getByRole('button', { name: /^suivant$/i }))

    // Étape 2
    const seche = await screen.findByText('Sèche', {}, { timeout: 3000 })
    fireEvent.click(seche)
    fireEvent.click(screen.getByRole('button', { name: /^suivant$/i }))

    // Étape 3
    await screen.findByText("Ton équipement", {}, { timeout: 3000 })
    // La sous-sélection n'est pas encore visible
    expect(screen.queryByText('Précise ton équipement personnel')).toBeNull()
    // Coche "Équipement personnel"
    fireEvent.click(screen.getByText('Équipement personnel'))
    // La sous-sélection apparaît
    await screen.findByText('Précise ton équipement personnel', {}, { timeout: 3000 })
    expect(screen.getByText('Kettlebell')).toBeTruthy()
    expect(screen.getByText('Barre de traction')).toBeTruthy()
    expect(screen.getByText('Banc')).toBeTruthy()
    expect(screen.getByText('Haltères')).toBeTruthy()
    expect(screen.getByText('Élastique de résistance')).toBeTruthy()
  })

  it('le bouton Suivant reste bloqué tant qu\'aucune endurance n\'est sélectionnée', async () => {
    function Demo() {
      return (
        <MemoryRouter initialEntries={['/onboarding']}>
          <Routes>
            <Route path="/onboarding" element={<MobileOnboardingWizard />} />
            <Route path="/merci" element={<div>MERCI</div>} />
            <Route path="*" element={<div>FALLBACK</div>} />
          </Routes>
        </MemoryRouter>
      )
    }
    render(<Demo />)
    // Étape 1
    const ageInput = await screen.findByPlaceholderText('25', {}, { timeout: 3000 })
    fireEvent.change(ageInput, { target: { value: '25' } })
    fireEvent.change(screen.getByRole('combobox', { name: /sexe/i }), { target: { value: 'Homme' } })
    fireEvent.change(screen.getByPlaceholderText('70'), { target: { value: '70' } })
    fireEvent.change(screen.getByPlaceholderText('175'), { target: { value: '175' } })
    fireEvent.change(screen.getByRole('combobox', { name: /niveau en sport/i }), { target: { value: 'Intermédiaire' } })
    fireEvent.click(screen.getByRole('button', { name: /^suivant$/i }))
    // Étape 2
    const seche = await screen.findByText('Sèche', {}, { timeout: 3000 })
    fireEvent.click(seche)
    fireEvent.click(screen.getByRole('button', { name: /^suivant$/i }))

    // Étape 3
    await screen.findByText("Ton équipement", {}, { timeout: 3000 })
    // Cocher juste un équipement principal
    fireEvent.click(screen.getByText('Salle de sport'))
    // Cliquer sur Suivant
    fireEvent.click(screen.getByRole('button', { name: /^suivant$/i }))
    // L'erreur doit apparaître
    await screen.findByText(/champs obligatoires/i, {}, { timeout: 3000 })
  })
})
