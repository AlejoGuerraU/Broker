import type { NextApiRequest, NextApiResponse } from 'next'

interface AlphaVantageMostActiveItem {
  ticker: string
  price: string
  change_amount: string
  change_percentage: string
  volume: string
}

interface AlphaVantageResponse {
  most_actively_traded?: AlphaVantageMostActiveItem[]
  Information?: string
  Note?: string
  'Error Message'?: string
}

interface MostActiveItem {
  id: number
  nombre: string
  simbolo: string
  precio: string
  variacion: number
  volumen: string
  logoTexto: string
  logoClase: string
}

const logoClasses = [
  'bg-[#E8EEF9] text-[#1C2430]',
  'bg-[#DFF7D8] text-[#1F5F27]',
  'bg-[#FFE3E2] text-[#8A1F1D]',
  'bg-[#FFF1D6] text-[#8A5B07]',
  'bg-[#DDEBFF] text-[#12438B]',
  'bg-[#E7E0FF] text-[#4D2CA3]',
]

const formatPrice = (value: string) => {
  const numberValue = Number(value)

  if (Number.isNaN(numberValue)) {
    return value
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue)
}

const formatVolume = (value: string) => {
  const numberValue = Number(value)

  if (Number.isNaN(numberValue)) {
    return value
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(numberValue)
}

const parseVariation = (value: string) => {
  const parsed = Number(value.replace('%', ''))
  return Number.isNaN(parsed) ? 0 : parsed
}

const buildLogoText = (ticker: string) => ticker.slice(0, 2).toUpperCase()

const buildName = (ticker: string) => ticker.toUpperCase()

const mapItem = (item: AlphaVantageMostActiveItem, index: number): MostActiveItem => ({
  id: index + 1,
  nombre: buildName(item.ticker),
  simbolo: item.ticker.toUpperCase(),
  precio: formatPrice(item.price),
  variacion: parseVariation(item.change_percentage),
  volumen: formatVolume(item.volume),
  logoTexto: buildLogoText(item.ticker),
  logoClase: logoClasses[index % logoClasses.length],
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ items: MostActiveItem[] } | { error: string }>,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY

  if (!apiKey) {
    return res.status(200).json({ error: 'Missing API key' })
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${apiKey}`,
    )

    if (!response.ok) {
      return res.status(502).json({ error: 'Could not fetch market data' })
    }

    const data = (await response.json()) as AlphaVantageResponse

    if (data['Error Message'] || data.Note) {
      return res.status(200).json({ error: data['Error Message'] ?? data.Note ?? 'Provider error' })
    }

    const items = (data.most_actively_traded ?? []).slice(0, 8).map(mapItem)

    return res.status(200).json({ items })
  } catch {
    return res.status(500).json({ error: 'Unexpected error fetching market data' })
  }
}
