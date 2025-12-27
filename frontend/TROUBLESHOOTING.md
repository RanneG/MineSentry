# Frontend Troubleshooting Guide

## Black Screen Issues

### Fixed: Duplicate QueryClientProvider

**Problem**: App.tsx was using `QueryClientProvider` and `queryClient` without importing them, causing a runtime error and black screen.

**Solution**: Removed the duplicate `QueryClientProvider` from App.tsx (it's already provided in main.tsx).

## Framework Clarification

**Important**: This is a **Vite + React** application, **NOT Next.js**.

- ✅ Uses Vite as the build tool
- ✅ Uses React Router for routing
- ✅ Structure: `src/pages/`, `src/components/`
- ❌ No `app/` directory (that's Next.js)
- ❌ No `pages/` directory at root (that's Next.js Pages Router)

## Common Issues & Solutions

### 1. Black Screen / Blank Page

**Check Browser Console (F12)**:
- Look for JavaScript errors
- Check Network tab for failed requests
- Verify all imports are resolved

**Check Terminal**:
- Look for compilation errors
- Verify all dependencies are installed: `npm install`
- Check if the dev server is running: `npm run dev`

### 2. Import Errors with `@/` Alias

**Solution**: The path alias is configured in `vite.config.ts`:
```typescript
resolve: {
  alias: {
    '@': path.resolve(process.cwd(), './src'),
  },
}
```

**Verify**: Make sure `vite.config.ts` exists (not `.js`)

### 3. Module Not Found Errors

**Check**:
1. File exists in the correct location
2. File extension matches (.tsx for React components)
3. Import path is correct
4. Run `npm install` to ensure dependencies are installed

### 4. Tailwind CSS Not Working

**Verify**:
1. `tailwind.config.js` exists
2. `postcss.config.js` exists
3. `index.css` imports Tailwind directives
4. CSS file is imported in `main.tsx`

### 5. TypeScript Errors

**Solution**:
- Check `tsconfig.json` configuration
- Verify path aliases are configured
- Run `npm run build` to see all TypeScript errors

## Development Workflow

### Start Development Server
```bash
cd frontend
npm install
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

### Check for Errors
```bash
npm run lint
npm run build
```

## File Structure

```
frontend/
├── src/
│   ├── main.tsx          # Entry point
│   ├── App.tsx           # Main app component
│   ├── index.css         # Global styles (Tailwind)
│   ├── pages/            # Page components
│   ├── components/       # Reusable components
│   ├── api/              # API client
│   ├── store/            # State management (Zustand)
│   └── types/            # TypeScript types
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── package.json          # Dependencies
```

## Browser Console Debugging

1. **Open DevTools** (F12 or Cmd+Option+I)
2. **Console Tab**: Check for JavaScript errors
3. **Network Tab**: Check for failed requests (404, 500)
4. **Elements Tab**: Verify HTML structure
5. **Sources Tab**: Set breakpoints for debugging

## Quick Fixes

### Clear Cache and Reinstall
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Check if Port is in Use
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Verify All Files Exist
```bash
test -f src/main.tsx && echo "✅ main.tsx exists"
test -f src/App.tsx && echo "✅ App.tsx exists"
test -f index.html && echo "✅ index.html exists"
test -f vite.config.ts && echo "✅ vite.config.ts exists"
```

## Still Having Issues?

1. Check the browser console for specific error messages
2. Verify all dependencies are installed: `npm install`
3. Try clearing browser cache and hard refresh (Cmd+Shift+R)
4. Check that the backend API is running on port 8000
5. Verify environment variables are set correctly

