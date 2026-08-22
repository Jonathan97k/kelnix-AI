# Run this once to set all Vercel environment variables
# Requires: npm i -g vercel && vercel login
# Then fill in your actual values from .env before running

Write-Host "Setting Vercel environment variables..."

$vars = @{
  "SUPABASE_URL"="YOUR_SUPABASE_URL"
  "SUPABASE_SERVICE_ROLE_KEY"="YOUR_SUPABASE_SERVICE_ROLE_KEY"
  "VITE_SUPABASE_URL"="YOUR_VITE_SUPABASE_URL"
  "VITE_SUPABASE_ANON_KEY"="YOUR_VITE_SUPABASE_ANON_KEY"
  "GEMINI_API_KEY"="YOUR_GEMINI_API_KEY"
  "OPENCODE_API_KEY"="YOUR_OPENCODE_API_KEY"
  "OPENCODE_MODEL"="opencode/mimo-v2.5-free"
  "OPENCODE_BASE_URL"="https://openrouter.ai/api/v1"
  "CLOUDINARY_CLOUD_NAME"="YOUR_CLOUDINARY_CLOUD_NAME"
  "CLOUDINARY_API_KEY"="YOUR_CLOUDINARY_API_KEY"
  "CLOUDINARY_API_SECRET"="YOUR_CLOUDINARY_API_SECRET"
}

foreach ($key in $vars.Keys) {
  Write-Host "Setting $key..."
  $vars[$key] | vercel env add $key production
}

Write-Host "All variables set! Now run: vercel --prod"
