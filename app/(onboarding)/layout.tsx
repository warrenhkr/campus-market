// Layout minimaliste pour l'onboarding — pas de Navbar ni BottomNav
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--background)' }}
    >
      {children}
    </div>
  )
}
