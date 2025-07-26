# Farcaster Mini App Storage Guide

## Overview

For Farcaster Mini Apps, the storage strategy needs to be different from traditional web applications. This guide explains the changes made to optimize storage for Mini Apps.

## Storage Strategy for Farcaster Mini Apps

### 1. **Session Storage** (Primary)
- **Use**: `sessionStorage` for data that should persist during the Mini App session
- **Persistence**: Data persists until the Mini App is closed or the session ends
- **Best for**: User sessions, authentication tokens, app state

### 2. **Memory Storage** (Secondary)
- **Use**: In-memory storage for temporary data
- **Persistence**: Data is lost when the page refreshes or app restarts
- **Best for**: Temporary UI state, form data, cached responses

### 3. **URL Parameters** (Tertiary)
- **Use**: URL search parameters for passing data between pages
- **Persistence**: Data is visible in the URL and persists through navigation
- **Best for**: Page-specific data, sharing links with state

## Changes Made

### 1. **Created Farcaster Storage Utility** (`src/lib/farcasterStorage.ts`)
- Provides a unified interface for all storage operations
- Handles fallbacks gracefully
- Supports async operations for future SDK integration

### 2. **Updated Authentication Context** (`src/context/AuthContext.tsx`)
- Replaced `localStorage` with `sessionStorage` for session data
- Uses async storage operations
- Maintains compatibility with existing code

### 3. **Updated App Component** (`src/entrypoints/popup/App.tsx`)
- Uses `sessionStorage` for free plan status
- Implements proper state management for storage changes
- Maintains real-time updates

## Key Benefits

### 1. **Better Mini App Performance**
- Faster access to stored data
- Reduced memory footprint
- Optimized for Mini App lifecycle

### 2. **Improved Security**
- Session-based storage is more secure than persistent storage
- Data is automatically cleared when the Mini App closes
- No sensitive data left on device

### 3. **Enhanced User Experience**
- Faster app startup
- Consistent state management
- Better error handling

## Usage Examples

### Storing User Session
```typescript
import { storeSession, getSession } from '@/lib/farcasterStorage';

// Store session
await storeSession(userSession);

// Retrieve session
const session = await getSession();
```

### Storing App Data
```typescript
import { farcasterStorage } from '@/lib/farcasterStorage';

// Store scan data
await farcasterStorage.setItem('scanData', scanResults);

// Get scan data
const data = await farcasterStorage.getItem('scanData');
```

### URL Parameters
```typescript
import { farcasterStorage } from '@/lib/farcasterStorage';

// Set URL parameter
farcasterStorage.setUrlParam('warning', 'true');

// Get URL parameter
const warning = farcasterStorage.getUrlParam('warning');
```

## Migration Checklist

- [x] Created Farcaster storage utility
- [x] Updated authentication context
- [x] Updated app component
- [ ] Update content script storage
- [ ] Update utility functions
- [ ] Update components that use localStorage
- [ ] Test all storage operations
- [ ] Verify data persistence across sessions

## Next Steps

1. **Update Content Script**: Replace localStorage usage in `src/entrypoints/content.ts`
2. **Update Utilities**: Update storage functions in utils directory
3. **Update Components**: Replace localStorage in remaining components
4. **Testing**: Verify all storage operations work correctly
5. **Performance**: Monitor and optimize storage performance

## Notes

- Session storage is cleared when the Mini App is closed
- Memory storage is lost on page refresh
- URL parameters are visible to users
- All storage operations are async for future compatibility
- Fallbacks ensure the app works even if storage is unavailable 