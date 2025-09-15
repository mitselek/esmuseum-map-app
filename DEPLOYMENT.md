# Deployment Guide

## JWT Audience Configuration

The application requires proper JWT audience configuration for production deployments due to Entu's authentication requirements.

### Problem
Entu validates JWT tokens against the exact callback URL origin. When deployed behind proxies or load balancers, the domain (`esmuseum.entu.ee`) may differ from the server IP that Entu expects for JWT audience validation.

### Solution

#### Option 1: Environment Variable (Recommended)
Set the callback origin explicitly using environment variables:

```bash
# For current production server
export NUXT_PUBLIC_CALLBACK_ORIGIN=https://209.38.213.121

# Or set in your deployment platform
NUXT_PUBLIC_CALLBACK_ORIGIN=https://209.38.213.121
```

#### Option 2: Runtime Configuration
Update `.config/nuxt.config.ts` with production values:

```typescript
runtimeConfig: {
  public: {
    callbackOrigin: process.env.NUXT_PUBLIC_CALLBACK_ORIGIN || ''
  }
}
```

#### Option 3: Automatic Detection (Current Fallback)
The code automatically detects `esmuseum.entu.ee` and uses `https://209.38.213.121`. This works but requires code updates when infrastructure changes.

### How to Find the Correct IP

If you encounter JWT audience validation errors like:
```
jwt audience invalid. expected: XXX.XXX.XXX.XXX
```

1. Check the production logs for the expected IP address
2. Update the environment variable or hardcoded fallback
3. Redeploy the application

### Testing the Fix

After deployment, monitor logs for:
- ✅ Successful profile API calls
- ✅ No "jwt audience invalid" errors
- ✅ Users can log in and access tasks

### Infrastructure Notes

- The IP address may change when servers are redeployed or scaled
- Using environment variables prevents code changes for infrastructure updates
- Consider asking your hosting provider about stable IP addresses or proper proxy configuration

### Recent IP Changes
- `64.226.65.17` (Previous)
- `209.38.213.121` (Current as of Sep 15, 2025)