'use client'

import { Toaster } from 'sonner'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster theme="system" position="top-right" />
    </>
  )
}
