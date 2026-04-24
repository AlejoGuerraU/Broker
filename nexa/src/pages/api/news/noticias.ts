import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const API_KEY = "EEMv8YdTMhiSr8xqn1ni2Sgt9yFr5dC6Nj5YCI3l"

    const response = await fetch(
        `https://api.marketaux.com/v1/news/all?countries=us&language=es&limit=10&api_token=${API_KEY}`
    )

    const data = await response.json()
    res.status(200).json(data)
}