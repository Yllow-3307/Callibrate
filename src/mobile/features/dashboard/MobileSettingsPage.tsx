import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ThemeToggle } from '../../../shared/components/ThemeToggle'
import { BottomNavigation } from '../../components/BottomNavigation'
import { Button } from '../../../shared/components/Button'

export function MobileSettingsPage() {
  const [playlistCalis, setPlaylistCalis] = useState('https://open.spotify.com/playlist/37i9dQZF1DX76t638V6eg8') // Spotify Workout mix par défaut
  const [playlistCardio, setPlaylistCardio] = useState('https://open.spotify.com/playlist/37i9dQZF1DX76t638V6eg8') // Spotify Cardio mix par défaut
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const savedCalis = localStorage.getItem('playlist_calisthénie')
    const savedCardio = localStorage.getItem('playlist_cardio')
    if (savedCalis) setPlaylistCalis(savedCalis)
    if (savedCardio) setPlaylistCardio(savedCardio)
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('playlist_calisthénie', playlistCalis)
    localStorage.setItem('playlist_cardio', playlistCardio)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-24 text-[var(--color-text)]">
      <header className="flex justify-between items-center px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur-md sticky top-0 z-30">
        <h1 className="text-xl font-bold">Paramètres</h1>
        <ThemeToggle />
      </header>

      <main className="px-6 py-8 max-w-md mx-auto">
        <motion.div
          className="glass-card p-6 flex flex-col gap-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-xl font-extrabold mb-2">Configuration Musique</h2>
          <p className="text-sm text-[var(--color-text-muted)] leading-snug">
            Configure ici tes liens Spotify, Deezer, YouTube ou Apple Music préférés pour les lancer instantanément selon le type d'entraînement du jour.
          </p>

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold">Playlist Callisthénie / Force</span>
              <input
                type="url"
                className="input-base"
                value={playlistCalis}
                onChange={(e) => setPlaylistCalis(e.target.value)}
                placeholder="Lien de la playlist (ex. Spotify/Deezer)"
                required
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold">Playlist Course / Cardio</span>
              <input
                type="url"
                className="input-base"
                value={playlistCardio}
                onChange={(e) => setPlaylistCardio(e.target.value)}
                placeholder="Lien de la playlist (ex. Spotify/Deezer)"
                required
              />
            </label>

            {saved && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-[rgb(var(--color-accent-rgb))] font-bold text-center mt-1"
              >
                Configuration enregistrée avec succès ! ✓
              </motion.p>
            )}

            <Button type="submit" variant="primary" size="md" style={{ width: '100%', marginTop: '8px' }}>
              Enregistrer mes playlists
            </Button>
          </form>
        </motion.div>
      </main>

      <BottomNavigation />
    </div>
  )
}
