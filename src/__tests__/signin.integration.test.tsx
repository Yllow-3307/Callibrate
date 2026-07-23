/**
 * Test d'intégration de bout en bout pour le bug 1.
 * On vérifie que la destination finale de la page de connexion dépend bien
 * de hasCompletedProfile.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
import MobileSignInPage from '../mobile/features/auth/MobileSignInPage'

function makeProfileLookup(profileExists: boolean, programExists: boolean) {
  return (table: string) => {
    if (table === 'profiles') {
      return {
        select: () => ({
          eq: () => ({
            limit: () => ({
              maybeSingle: () => Promise.resolve({ data: profileExists ? { id: 'x' } : null, error: null }),
            }),
          }),
        }),
      }
    }
    if (table === 'programs') {
      return {
        select: () => ({
          eq: () => ({
            limit: () => ({
              maybeSingle: () => Promise.resolve({ data: programExists ? { id: 'y' } : null, error: null }),
            }),
          }),
        }),
      }
    }
    return {} as any
  }
}

beforeEach(() => {
  mockSignInWithPassword.mockReset()
  mockGetSession.mockReset()
  mockOnAuthStateChange.mockReset()
  mockFrom.mockReset()
  // Reset to known initial state: pas d'utilisateur, pas en chargement
  useAuthStore.setState({ user: null, loading: false })
})

describe('A1 — flux post-connexion MobileSignInPage', () => {
  it('avec session active au mount et profil complet → va au dashboard', async () => {
    const fakeUser = { id: 'u1', email: 'a@b.c', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '2026-01-01' } as any
    mockGetSession.mockResolvedValue({ data: { session: { user: fakeUser } } })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    mockFrom.mockImplementation(makeProfileLookup(true, true))

    // pré-remplir le store
    useAuthStore.setState({ user: fakeUser, loading: false })

    function Demo() {
      return (
        <MemoryRouter initialEntries={['/connexion']}>
          <Routes>
            <Route path="/connexion" element={<MobileSignInPage />} />
            <Route path="/onboarding" element={<div>ONBOARDING</div>} />
            <Route path="/tableau-de-bord" element={<div>DASHBOARD</div>} />
            <Route path="*" element={<div>FALLBACK</div>} />
          </Routes>
        </MemoryRouter>
      )
    }

    render(<Demo />)
    await waitFor(() => expect(screen.queryByText('DASHBOARD')).not.toBeNull(), { timeout: 2000 })
  })

  it('avec session active au mount et profil incomplet → va à /onboarding', async () => {
    const fakeUser = { id: 'u2', email: 'x@y.z', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '2026-01-01' } as any
    mockGetSession.mockResolvedValue({ data: { session: { user: fakeUser } } })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    mockFrom.mockImplementation(makeProfileLookup(false, false))

    useAuthStore.setState({ user: fakeUser, loading: false })

    function Demo() {
      return (
        <MemoryRouter initialEntries={['/connexion']}>
          <Routes>
            <Route path="/connexion" element={<MobileSignInPage />} />
            <Route path="/onboarding" element={<div>ONBOARDING</div>} />
            <Route path="/tableau-de-bord" element={<div>DASHBOARD</div>} />
            <Route path="*" element={<div>FALLBACK</div>} />
          </Routes>
        </MemoryRouter>
      )
    }

    render(<Demo />)
    await waitFor(() => expect(screen.queryByText('ONBOARDING')).not.toBeNull(), { timeout: 2000 })
  })

  it('affiche le formulaire de connexion quand aucune session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    mockFrom.mockImplementation(makeProfileLookup(false, false))

    useAuthStore.setState({ user: null, loading: false })

    function Demo() {
      return (
        <MemoryRouter initialEntries={['/connexion']}>
          <Routes>
            <Route path="/connexion" element={<MobileSignInPage />} />
            <Route path="/onboarding" element={<div>ONBOARDING</div>} />
            <Route path="/tableau-de-bord" element={<div>DASHBOARD</div>} />
            <Route path="*" element={<div>FALLBACK</div>} />
          </Routes>
        </MemoryRouter>
      )
    }

    render(<Demo />)
    // On doit voir le formulaire (email + password + bouton)
    expect((await screen.findByPlaceholderText('toi@exemple.com'))).toBeTruthy()
    expect(screen.getByPlaceholderText('••••••••')).toBeTruthy()
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeTruthy()
  })
})
