import { prisma } from '@/lib/prisma'

const SUPPORTED_CURRENCIES = new Set(['USD', 'MXN', 'EUR'])
const DEFAULT_CURRENCY = 'USD'

export async function getAgencyCurrency() {
  try {
    const settings = await prisma.agencySettings.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { currency: true },
    })

    const currency = settings?.currency?.toUpperCase() ?? DEFAULT_CURRENCY
    return SUPPORTED_CURRENCIES.has(currency) ? currency : DEFAULT_CURRENCY
  } catch {
    return DEFAULT_CURRENCY
  }
}

export function formatMoney(value: number, currency: string) {
  const safeCurrency = SUPPORTED_CURRENCIES.has(currency) ? currency : DEFAULT_CURRENCY
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: safeCurrency,
    maximumFractionDigits: 0,
  }).format(value)
}
