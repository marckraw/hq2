# Technical Debt & Known Issues

This document tracks technical debt, known issues, and decisions that need future attention.

## Package Version Locks

### storyblok-js-client v6.11.0 (LOCKED)

**Status**: 🔒 **DO NOT UPGRADE TO v7+**

**Issue**: storyblok-js-client version 7.0.0+ introduces breaking changes that cause 404 errors in Management API calls, specifically for the `getStoryContent()` function.

**Details**:

- Version 7 changed internal client behavior for Management API endpoints
- Manual fetch requests work fine, but StoryblokClient calls fail with 404
- Attempted fixes (empty {} parameter, endpoint configuration) did not resolve the issue
- Version 6.11.0 works perfectly for all our use cases

**Impact**:

- All Storyblok functionality works correctly on v6.11.0
- Management API calls (spaces, stories, content) function as expected
- No immediate need to upgrade

**Future Action**:

- Monitor storyblok-js-client releases for bug fixes
- Test v7+ when patch versions are released
- Consider upgrade only when Management API issues are resolved

**Date**: January 2025  
**Reporter**: Development Team  
**Related Files**:

- `packages/thegrid/src/domains/integration/services/StoryblokService/storyblok.service.ts`
- `packages/thegrid/package.json`

---

## Future Items to Track

Add other technical debt items here as they arise...
