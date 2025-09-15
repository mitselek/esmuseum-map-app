# Deployment Guide

## JWT Audience Configuration

The application requires proper JWT audience configuration for production deployments due to Entu's authentication requirements.

### Problem
Entu validates JWT tokens against the exact callback URL origin. The current issue is that Entu's OAuth configuration expects a server IP address (`209.38.213.121`) but the application runs on a domain (`https://esmuseum.entu.ee`).

### Correct Solution: Update Entu OAuth Configuration

**The proper fix is to configure Entu to accept domain-based callbacks:**

1. **Access your Entu account settings** or contact Entu support
2. **Update OAuth application callback URLs** to include:
   - `https://esmuseum.entu.ee/auth/callback`
3. **Ensure JWT audience validation** accepts the domain instead of IP

### Current Workaround (Temporary)

If you cannot update Entu configuration immediately, you can use the IP address:

```bash
# Set environment variable to use IP address
export NUXT_PUBLIC_CALLBACK_ORIGIN=https://209.38.213.121
```

But this is **not recommended** because:
- IP addresses may change with infrastructure updates
- Users see IP addresses in browser during OAuth flow
- It's not a scalable solution

### How to Verify the Configuration

#### Check Current Callback URL
When starting OAuth flow, look for logs showing:
```
Full Auth URL: https://entu.app/api/auth/google?account=esmuuseum&next=https%3A//esmuseum.entu.ee/auth/callback%3Fjwt%3D
```

#### Expected Behavior After Fix
- ✅ Users authenticate on `https://esmuseum.entu.ee`
- ✅ OAuth redirects back to `https://esmuseum.entu.ee/auth/callback`
- ✅ JWT validation succeeds with domain-based audience
- ✅ No "jwt audience invalid" errors

### Infrastructure Notes

The mismatch suggests either:
1. **Entu OAuth app configuration** needs updating to accept domain callbacks
2. **Reverse proxy/load balancer** isn't properly forwarding domain information
3. **SSL certificate configuration** issues

Contact your Entu account administrator or support to resolve OAuth callback URL configuration.