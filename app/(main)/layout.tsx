import { Navbar } from '@/components/Navbar'
import { PageTransition } from '@/components/PageTransition'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Navbar />
      <PageTransition>
        <main className="flex-1">
          {children}
        </main>
      </PageTransition>
    </div>
  )
}