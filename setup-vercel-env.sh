#!/bin/bash
# Run this once to set all Vercel environment variables
# Requires: npm i -g vercel && vercel login
# Then fill in your actual values from .env before running

echo "Setting Vercel environment variables..."

vercel env add SUPABASE_URL production <<< 'YOUR_SUPABASE_URL'
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< 'YOUR_SUPABASE_SERVICE_ROLE_KEY'
vercel env add VITE_SUPABASE_URL production <<< 'YOUR_VITE_SUPABASE_URL'
vercel env add VITE_SUPABASE_ANON_KEY production <<< 'YOUR_VITE_SUPABASE_ANON_KEY'
vercel env add GEMINI_API_KEY production <<< 'YOUR_GEMINI_API_KEY'
vercel env add OPENCODE_API_KEY production <<< 'YOUR_OPENCODE_API_KEY'
vercel env add OPENCODE_MODEL production <<< 'opencode/mimo-v2.5-free'
vercel env add OPENCODE_BASE_URL production <<< 'https://openrouter.ai/api/v1'
vercel env add CLOUDINARY_CLOUD_NAME production <<< 'YOUR_CLOUDINARY_CLOUD_NAME'
vercel env add CLOUDINARY_API_KEY production <<< 'YOUR_CLOUDINARY_API_KEY'
vercel env add CLOUDINARY_API_SECRET production <<< 'YOUR_CLOUDINARY_API_SECRET'

echo "All variables set! Now run: vercel --prod"
