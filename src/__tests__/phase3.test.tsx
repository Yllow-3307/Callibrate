import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Mock Supabase
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
import MobileDashboardPlaceholder from '../mobile/features/dashboard/MobileDashboardPlaceholder'
import { MobileSettingsPage } from '../mobile/features/dashboard/MobileSettingsPage'
import { BottomNavigation } from '../mobile/components/BottomNavigation'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

beforeEach(() => {
  mockFrom.mockReset()
  mockGetSession.mockResolvedValue({ data: { session: null } })
  mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
  mockFrom.mockImplementation(() => ({
    upsert: () => Promise.resolve({ data: null, error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
  }))
  const fakeUser = { id: 'u1', email: 'a@b.c', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '2026-01-01' } as any
  useAuthStore.setState({ user: fakeUser, loading: false })
})

describe('Phase 3 — Tests Unitaires & Intégration', () => {

  describe('BottomNavigation', () => {
    it('affiche tous les onglets requis', () => {
      render(
        <MemoryRouter initialEntries={['/tableau-de-bord']}>
          <BottomNavigation />
        </MemoryRouter>
      )

      expect(screen.getByRole('button', { name: /Accueil/i })).toBeTruthy()
      expect(screen.getByRole('button', { name: /Séances/i })).toBeTruthy()
      expect(screen.getByRole('button', { name: /Nutrition/i })).toBeTruthy()
      expect(screen.getByRole('button', { name: /Programme/i })).toBeTruthy()
      expect(screen.getByRole('button', { name: /Progrès/i })).toBeTruthy()
      expect(screen.getByRole('button', { name: /Mesures/i })).toBeTruthy()
      expect(screen.getByRole('button', { name: /Paramètres/i })).toBeTruthy()
    })
  })

  describe('MobileDashboardPlaceholder', () => {
    it('affiche le Streak initial, les compteurs de séances et la jauge de progression', () => {
      render(
        <MemoryRouter>
          <MobileDashboardPlaceholder />
        </MemoryRouter>
      )

      // Indicateur de Streak / Flamme
      expect(screen.getByText('3 jours')).toBeTruthy()
      expect(screen.getByText('Série en cours', { exact: false })).toBeTruthy()

      // Compteur de séances réalisés / cibles
      expect(screen.getByText('2 / 4')).toBeTruthy()
      expect(screen.getByText('Séances cette semaine', { exact: false })).toBeTruthy()

      // Progression du programme
      expect(screen.getByText('15 %')).toBeTruthy()
      expect(screen.getByText('Progression du Programme', { exact: false })).toBeTruthy()
    })

    it('affiche le calendrier hebdomadaire interactif cliquable et met à jour les séances', () => {
      render(
        <MemoryRouter>
          <MobileDashboardPlaceholder />
        </MemoryRouter>
      )

      // Le calendrier affiche les jours de la semaine courante
      // Lun, Mar, Mer, Jeu, Ven, Sam, Dim (avec première lettre en majuscule, ex: Lun, Mar, Mer...)
      expect(screen.getByText('Lun')).toBeTruthy()
      expect(screen.getByText('Mar')).toBeTruthy()
      expect(screen.getByText('Mer')).toBeTruthy()

      // Par défaut, Lundi et Mercredi sont complétés (2 / 4).
      // On clique sur Mardi (qui est au repos ou non complété par défaut) pour le valider.
      const marButton = screen.getByText('Mar').closest('button')
      expect(marButton).toBeTruthy()

      fireEvent.click(marButton!)

      // Après le clic, le compteur de séances passe à 3 / 4
      expect(screen.getByText('3 / 4')).toBeTruthy()
    })

    it('ouvre la playlist externe de musique du jour', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

      render(
        <MemoryRouter>
          <MobileDashboardPlaceholder />
        </MemoryRouter>
      )

      const musicButton = screen.getByRole('button', { name: /Écouter ma playlist du jour/i })
      expect(musicButton).toBeTruthy()

      fireEvent.click(musicButton)

      // Vérifie que window.open a été appelé avec un lien Spotify ou personnalisé
      expect(openSpy).toHaveBeenCalled()
      expect(openSpy.mock.calls[0][0]).toContain('spotify.com')
      expect(openSpy.mock.calls[0][1]).toBe('_blank')

      openSpy.mockRestore()
    })
  })

  describe('MobileSettingsPage', () => {
    it('permet de configurer et sauvegarder ses liens de playlists personnalisées', async () => {
      render(
        <MemoryRouter>
          <MobileSettingsPage />
        </MemoryRouter>
      )

      const calisInput = screen.getByLabelText(/Playlist Callisthénie \/ Force/i) as HTMLInputElement
      const cardioInput = screen.getByLabelText(/Playlist Course \/ Cardio/i) as HTMLInputElement
      const saveButton = screen.getByRole('button', { name: /Enregistrer mes playlists/i })

      expect(calisInput).toBeTruthy()
      expect(cardioInput).toBeTruthy()
      expect(saveButton).toBeTruthy()

      // On modifie les URLs de playlists
      fireEvent.change(calisInput, { target: { value: 'https://deezer.com/playlist/calisthenics' } })
      fireEvent.change(cardioInput, { target: { value: 'https://deezer.com/playlist/cardiorun' } })

      fireEvent.click(saveButton)

      // Attendre le message de succès
      await waitFor(() => {
        expect(screen.getByText(/Configuration enregistrée avec succès/i)).toBeTruthy()
      })

      // Vérifier la persistance locale dans localStorage
      expect(localStorage.getItem('playlist_calisthénie')).toBe('https://deezer.com/playlist/calisthenics')
      expect(localStorage.getItem('playlist_cardio')).toBe('https://deezer.com/playlist/cardiorun')
    })
  })

})
