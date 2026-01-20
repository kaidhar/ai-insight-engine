interface SmartSearchRequest {
  query: string;
  company_name?: string;
  budget_mode?: 'auto' | 'fast_only' | 'deep_only';
}

interface SmartSearchResponse {
  tierUsed: 'tier1_fast' | 'tier2_deep';
  cost: number;
  answer: string;
  upgradeReason?: string;
}

export async function callSmartSearch(request: SmartSearchRequest): Promise<SmartSearchResponse> {
  // Use relative path for API calls (works in production on Vercel)
  const endpoint = '/api/smart-search';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    // Check if we got HTML back (means API route doesn't exist in dev)
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('text/html')) {
      throw new Error('API endpoint not available in local development. Please deploy to Vercel to test real API calls.');
    }

    if (!response.ok) {
      let errorMessage = 'API request failed';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Smart search API error:', error);
    throw error;
  }
}
