import { Navbar } from '@/components/Navbar'
import { PageTransition } from '@/components/PageTransition'
import { BottomNav } from '@/components/BottomNav'
import { FooterLegal } from '@/components/FooterLegal'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Navbar />
      <PageTransition>
        {/* pb-24 ensures the content isn't hidden behind the fixed BottomNav on mobile (height ~4rem + 1rem padding) */}
        <main className="flex-1 pb-24 md:pb-0">
          {children}
        </main>
      </PageTransition>
      <FooterLegal />
      <BottomNav />
    </div>
  )
}