# API Integration Setup Guide

This guide explains how to set up the OpenAI API integration for real-time smart search.

## 🔐 Security Setup

### Step 1: Get a New OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. **REVOKE the old key you shared** (it's compromised)
3. Click "Create new secret key"
4. Copy the new key

### Step 2: Configure Environment Variables

1. Open the `.env` file in the project root
2. Replace `your-new-api-key-here-replace-this` with your actual API key:

```env
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
```

3. **Never commit this file to git** (it's already in .gitignore)

### Step 3: Configure Vercel Environment Variables

For production deployment on Vercel:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add a new variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key
   - **Environments**: Production, Preview, Development

## 🚀 How It Works

### Architecture

```
Frontend (React) → Vercel API Endpoint → OpenAI API
                    (/api/smart-search)
```

- **Frontend**: Sends query + company name
- **Backend API**: Securely stores API key, calls OpenAI
- **Response**: Returns answer + tier used + cost

### API Endpoint

Located at: `/api/smart-search.ts`

**Request:**
```json
{
  "query": "is the company trying to go {COMPANY_NAME}",
  "company_name": "TechCorp Inc.",
  "budget_mode": "auto"
}
```

**Response:**
```json
{
  "tierUsed": "tier1_fast",
  "cost": 1,
  "answer": "Based on available information...",
  "upgradeReason": null
}
```

### Tier Selection

- **tier1_fast**: Uses `gpt-4o-mini` (1 credit, 200 tokens max)
- **tier2_deep**: Uses `gpt-4o` (6 credits, 500 tokens max)

The system automatically chooses based on query complexity:
- Simple queries → Fast tier
- Complex queries → Deep tier

## 🧪 Testing Locally

1. Make sure `.env` has your API key
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open the app and click "Preview" in the AI Enrichment modal
4. The system will make 5 real API calls (one per mock company)
5. Check the browser console for any errors

## 📦 Deployment to Vercel

1. Make sure environment variables are set in Vercel dashboard
2. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add API integration"
   git push
   ```
3. Vercel will automatically deploy
4. Test the preview feature on the live site

## 💰 Cost Considerations

- **Fast Search** (gpt-4o-mini): ~$0.00025 per request
- **Deep Search** (gpt-4o): ~$0.002 per request
- 5 preview calls ≈ $0.00125 - $0.01

## 🐛 Troubleshooting

### "API request failed"
- Check if `OPENAI_API_KEY` is set in `.env` or Vercel
- Verify the key is valid at https://platform.openai.com/api-keys

### "CORS error"
- The API route handles CORS automatically
- Make sure you're calling `/api/smart-search` not an external URL

### No response from API
- Check browser console for errors
- Check Vercel function logs in the Vercel dashboard

## 🔒 Security Best Practices

✅ **DO:**
- Keep API keys in `.env` file
- Use Vercel environment variables for production
- Never commit `.env` to git

❌ **DON'T:**
- Share API keys publicly
- Commit secrets to version control
- Use API keys directly in frontend code

## 📝 Next Steps

1. Replace the OpenAI API key with your new one
2. Test locally with `npm run dev`
3. Deploy to Vercel
4. Monitor usage at https://platform.openai.com/usage
