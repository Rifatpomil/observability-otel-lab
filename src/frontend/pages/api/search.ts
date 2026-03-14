import type { NextApiRequest, NextApiResponse } from 'next';
import InstrumentationMiddleware from '../../../utils/telemetry/InstrumentationMiddleware';

const { LLM_BASE_URL = '' } = process.env;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Missing query' });
  }

  try {
    // Call the LLM service /v1/search endpoint
    const response = await fetch(`${LLM_BASE_URL}/search?q=${encodeURIComponent(q as string)}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ error: 'Search service unavailable' });
  }
};

export default InstrumentationMiddleware(handler);
