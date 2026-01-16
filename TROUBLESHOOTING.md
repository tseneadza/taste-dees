# Troubleshooting Guide

## Common Issues and Solutions

### Tailwind CSS Build Error

**Error Message:**
```
Error evaluating Node.js code
CssSyntaxError: tailwindcss: Can't resolve 'tailwindcss'
```

**Solution:**
This typically happens when the dev server cache is stale. Clear the cache and restart:

```bash
# Kill any running dev servers
lsof -ti:8085 | xargs kill -9

# Clear the Next.js cache
rm -rf .next
# OR force delete if needed
find .next -type f -delete && rm -rf .next

# Restart the dev server
npm run dev
```

### Port Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::8085
```

**Solution:**
```bash
# Kill the process using port 8085
lsof -ti:8085 | xargs kill -9

# Then restart
npm run dev
```

### TypeScript Errors

**Solution:**
```bash
# Check for type errors
npx tsc --noEmit

# If you see errors in node_modules, clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Fails After Code Changes

**Solution:**
```bash
# Clear all caches
rm -rf .next node_modules/.cache

# Rebuild
npm run build
```

### Cart Not Persisting

**Symptoms:** Cart items disappear on page refresh

**Solutions:**
1. Check if localStorage is enabled in your browser
2. Check browser console for errors
3. Clear localStorage manually:
   ```javascript
   localStorage.removeItem('taste-dees-cart')
   ```
4. Try in incognito mode to rule out browser extensions

### Products Not Displaying

**Check:**
1. Verify `src/data/products.ts` exists and has products
2. Check browser console for import errors
3. Verify CartProvider is wrapped around the app in `layout.tsx`

### Cart Count Not Updating

**Solution:**
Make sure `CartProvider` is wrapping your app in `src/app/layout.tsx`:
```typescript
<CartProvider>
  {children}
</CartProvider>
```

## Fresh Start

If all else fails, do a complete reset:

```bash
# Stop all processes
lsof -ti:8085 | xargs kill -9

# Clean everything
rm -rf .next node_modules/.cache

# Fresh install (optional, if needed)
rm -rf node_modules package-lock.json
npm install

# Build and run
npm run build
npm run dev
```

## Environment Issues

### Node.js Version
Make sure you're using Node.js 18+ (recommended 20+):
```bash
node --version
```

### NPM Version
```bash
npm --version
```

### Check Dependencies
```bash
npm list tailwindcss @tailwindcss/postcss next react
```

## Development Workflow

### Recommended Flow
1. Make code changes
2. Save file
3. Dev server hot-reloads automatically
4. If you see errors, check console first
5. If hot reload isn't working, restart dev server
6. If restart doesn't help, clear `.next` cache

### When to Clear Cache
- After major dependency updates
- After changing config files (next.config.ts, postcss.config.mjs)
- When seeing strange build errors
- After pulling new changes from git

## Port Configuration

The app runs on port 8085 by default. To change it:

```bash
# Using environment variable
PORT=3002 npm run dev

# Or modify package.json:
"dev": "next dev -p 3002"
```

## Debugging Cart Issues

### Check Cart State in Console
```javascript
// In browser console
localStorage.getItem('taste-dees-cart')

// Should return JSON string of cart items
```

### React DevTools
1. Install React DevTools browser extension
2. Open DevTools
3. Navigate to "Components" tab
4. Find `CartProvider` to inspect state

## Getting Help

If issues persist:
1. Check the error message carefully
2. Look for the file path in the error
3. Check that file exists and has no syntax errors
4. Try the "Fresh Start" steps above
5. Check the browser console for client-side errors
6. Check the terminal for server-side errors

## Known Warnings (Safe to Ignore)

These warnings are from existing files and don't affect functionality:

```
warning: Custom fonts not added in pages/_document.js
warning: 'index' is defined but never used
```

## Production Issues

If production build works but dev doesn't:
```bash
# Run production locally to test
npm run build
npm start
```

This runs on port 3002 by default.
