#!/bin/bash
# Run this in the stackrank365 folder to diagnose startup issues
# Usage: bash DIAGNOSE.sh

echo "=== StackRank365 Diagnostics ==="
echo ""

echo "1. Node version (need 16+):"
node --version

echo ""
echo "2. npm version:"
npm --version

echo ""
echo "3. node_modules exists?"
[ -d node_modules ] && echo "✅ Yes ($(ls node_modules | wc -l | tr -d ' ') packages)" || echo "❌ No — run: npm install"

echo ""
echo "4. Vite installed?"
[ -f node_modules/.bin/vite ] && echo "✅ Yes" || echo "❌ No — run: npm install"

echo ""
echo "5. Key source files present?"
for f in src/main.jsx src/App.jsx src/components/Nav.jsx src/components/Logo.jsx src/pages/Landing2.jsx src/index.css index.html; do
  [ -f "$f" ] && echo "  ✅ $f" || echo "  ❌ MISSING: $f"
done

echo ""
echo "6. Public assets present?"
for f in public/favicon.ico public/og-image.png; do
  [ -f "$f" ] && echo "  ✅ $f" || echo "  ⚠️  Missing: $f (not critical)"
done

echo ""
echo "=== If all checks pass, run: npm run dev -- --port 3000 ==="
