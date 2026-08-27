import { prisma } from '@/lib/prisma'

const FEDAPAY_SANDBOX_API_URL = 'https://sandbox-api.fedapay.com/v1'
const FEDAPAY_LIVE_API_URL = 'https://api.fedapay.com/v1'

type FedaPayMode = 'sandbox' | 'live'

function getEnvMode(): FedaPayMode {
  const configuredMode = (process.env.FEDAPAY_ENV ?? 'sandbox').toLowerCase()
  return configuredMode === 'live' || configuredMode === 'production' ? 'live' : 'sandbox'
}

export async function getFedaPayConfig() {
  let mode = getEnvMode()
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'fedapay_mode' } })
    if (setting?.value === 'sandbox' || setting?.value === 'live') mode = setting.value
  } catch {
    // Use the environment fallback if settings are unavailable during startup.
  }

  return {
    mode,
    apiUrl: mode === 'live' ? FEDAPAY_LIVE_API_URL : FEDAPAY_SANDBOX_API_URL,
    secretKey: mode === 'live'
      ? process.env.FEDAPAY_LIVE_SECRET_KEY ?? process.env.FEDAPAY_SECRET_KEY
      : process.env.FEDAPAY_SECRET_KEY,
    webhookSecret: mode === 'live'
      ? process.env.FEDAPAY_LIVE_WEBHOOK_SECRET ?? process.env.FEDAPAY_WEBHOOK_SECRET
      : process.env.FEDAPAY_WEBHOOK_SECRET,
  }
}

export function getFedaPayTransactionPayUrl(transactionId: string, apiUrl: string): string {
  return `${apiUrl}/transactions/${encodeURIComponent(transactionId)}/pay`
}
