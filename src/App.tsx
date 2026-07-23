import { useAuth } from './shared/hooks/useAuth'
import { useDeviceType } from './shared/hooks/useDeviceType'
import MobileRoutes from './mobile/routes'
import DesktopRoutes from './desktop/routes'

function App() {
  useAuth()
  const { isMobile } = useDeviceType()

  // Utilise un arbre de routes complètement séparé selon l'appareil
  return isMobile ? <MobileRoutes /> : <DesktopRoutes />
}

export default App
