#!/bin/bash
# Start Cloudflare Tunnel for webhook testing
# This exposes your local dev server to the internet so Entu can send webhooks

echo "🚇 Starting Cloudflare Tunnel..."
echo ""
echo "Make sure your dev server is running in another terminal:"
echo "  npm run dev"
echo ""
echo "Tunnel will expose http://localhost:3000 to the internet."
echo ""
echo "Press Ctrl+C to stop the tunnel when done testing."
echo ""
echo "======================================================"
echo ""

cloudflared tunnel --url http://localhost:3000
