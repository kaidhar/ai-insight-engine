import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SearchRequest {
  query: string;
  company_name?: string;
  budget_mode?: 'auto' | 'fast_only' | 'deep_only';
}

interface SearchResponse {
  tierUsed: 'tier1_fast' | 'tier2_deep';
  cost: number;
  answer: string;
  upgradeReason?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, company_name, budget_mode = 'auto' } as SearchRequest = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Analyze query complexity
    const complexity = analyzeComplexity(query);

    // Determine which tier to use
    const tierUsed = determineTier(complexity, budget_mode);

    // Call OpenAI API
    const answer = await callOpenAI(query, company_name, tierUsed);

    // Build response
    const response: SearchResponse = {
      tierUsed,
      cost: tierUsed === 'tier1_fast' ? 1 : 6,
      answer,
      upgradeReason: tierUsed === 'tier2_deep' ? getUpgradeReason(complexity) : undefined
    };

    return res.status(200).json(response);

  } catch (error: any) {
    console.error('Smart search error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Analyze query complexity
function analyzeComplexity(query: string): 'simple' | 'medium' | 'complex' {
  const lowerQuery = query.toLowerCase();

  // Complex indicators
  const complexIndicators = ['analyze', 'compare', 'evaluate', 'likelihood', 'assess', 'competitive'];
  if (complexIndicators.some(indicator => lowerQuery.includes(indicator))) {
    return 'complex';
  }

  // Medium indicators
  const mediumIndicators = ['why', 'how', 'explain', 'recent', 'strategy'];
  if (mediumIndicators.some(indicator => lowerQuery.includes(indicator))) {
    return 'medium';
  }

  return 'simple';
}

// Determine which tier to use
function determineTier(
  complexity: 'simple' | 'medium' | 'complex',
  mode: 'auto' | 'fast_only' | 'deep_only'
): 'tier1_fast' | 'tier2_deep' {
  if (mode === 'fast_only') return 'tier1_fast';
  if (mode === 'deep_only') return 'tier2_deep';

  // Auto mode - intelligent selection
  if (complexity === 'complex') return 'tier2_deep';
  if (complexity === 'medium') return Math.random() > 0.5 ? 'tier2_deep' : 'tier1_fast';
  return 'tier1_fast';
}

// Get upgrade reason
function getUpgradeReason(complexity: 'simple' | 'medium' | 'complex'): string {
  switch (complexity) {
    case 'complex':
      return 'Complex query detected - used Deep Search directly';
    case 'medium':
      return 'Fast search found basic info, but query needs more analysis';
    default:
      return 'Insufficient detail in initial results';
  }
}

// Call OpenAI API
async function callOpenAI(
  query: string,
  companyName: string | undefined,
  tier: 'tier1_fast' | 'tier2_deep'
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Replace {COMPANY_NAME} placeholder
  const processedQuery = companyName
    ? query.replace(/\{COMPANY_NAME\}/gi, companyName)
    : query;

  // Build prompt based on tier
  const prompt = tier === 'tier1_fast'
    ? `You are a fast research assistant. Answer concisely and directly.\n\nQuery: ${processedQuery}`
    : `You are an intelligent research assistant with deep reasoning capabilities. Provide a thorough, well-reasoned answer.\n\nQuery: ${processedQuery}`;

  // Call OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: tier === 'tier1_fast' ? 'gpt-4o-mini' : 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful research assistant.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: tier === 'tier1_fast' ? 200 : 500
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response generated';
}
