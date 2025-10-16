# Student Signup Guide

**Audience**: Students, Teachers, Administrators  
**Feature**: Student Onboarding Flow (FEAT-001)  
**Last Updated**: October 16, 2025

## Overview

This guide explains how students join a group in the Estonian War Museum (Eesti Sõjamuuseum) Map Application. The signup process is simple and takes about 30 seconds.

**Important**: "ES" stands for "Eesti Sõja" (Estonian War), NOT "Estonian Sports". See [Project Naming](../PROJECT-NAMING.md) for details.

---

## For Students

### How to Sign Up

#### Step 1: Get Your Signup Link

Your teacher will provide a unique signup link that looks like this:

```text
https://esmuseum.app/signup/686a6c011749f351b9c83124
```

The long code at the end is your group's unique ID.

#### Step 2: Click the Link

Open the link in your web browser (Chrome, Firefox, Safari, or Edge). You'll see a screen with:

- **Title**: "Liitu õpperühmaga" (Join Study Group)
- **Button**: "Alusta registreerimist" (Start Registration)

#### Step 3: Login with Google

Click the "Start Registration" button. You'll be redirected to Google login. Sign in with your Google account (usually your school email).

**Note**: The app only uses Google for authentication. We don't access your email or other Google data.

#### Step 4: Wait for Confirmation

After logging in, you'll see a loading screen:

- **Spinning circle**: Shows the app is working
- **Message**: "Palun oota..." (Please wait...)
- **Subtext**: "Määrame sind õpperühmale..." (We're assigning you to the study group...)

This usually takes **5-10 seconds**. Don't close the browser!

#### Step 5: Success

Once confirmed, you'll be automatically redirected to your dashboard where you can start using the app.

---

### Troubleshooting

#### "Timeout" Message

If you see a yellow warning box with "Timeout" after 30 seconds:

**What it means**: The server is taking longer than expected to confirm your membership.

**What to do**:

1. Click the "Proovi uuesti" (Try Again) button
2. If it fails again, wait 1-2 minutes and try the signup link again
3. If still failing, contact your teacher

**Why it happens**: Sometimes Entu's database takes time to synchronize data across servers.

#### "Error" Message

If you see a red error box:

**Common errors**:

- **"Invalid group ID"**: The signup link is incorrect. Ask your teacher for the correct link.
- **"Already a member"**: You're already in the group! Try going directly to the app.
- **"Network error"**: Check your internet connection and try again.

**What to do**:

1. Read the error message carefully
2. Click the "Proovi uuesti" (Try Again) button
3. If the error persists, take a screenshot and contact your teacher

#### Browser Compatibility

The app works best on:

- ✅ **Chrome** (version 90 or newer)
- ✅ **Firefox** (version 88 or newer)
- ✅ **Safari** (version 14 or newer)
- ✅ **Edge** (version 90 or newer)

**Mobile**: The signup works perfectly on phones and tablets!

#### Privacy & Cookies

The app needs to store a small "cookie" (text file) in your browser to remember you're logged in. If you have cookies disabled:

1. Enable cookies for `esmuseum.app`
2. Try the signup link again

---

## For Teachers

### How to Create a Signup Link

1. Log in to your teacher account
2. Go to your class/group settings
3. Copy the "Student Signup Link"
4. Share it with your students (email, Google Classroom, etc.)

**Important**: Each group has a unique link. Don't mix up links for different classes!

### Sharing the Link

**Good ways to share**:

- Email to students
- Post in Google Classroom
- Share in Microsoft Teams
- Write on the board (use a QR code generator!)

**Example message**:

```text
📚 Join our War Museum History class!

Click this link to sign up:
https://esmuseum.app/signup/686a6c011749f351b9c83124

You'll need to log in with your Google account.
This takes about 30 seconds. See you inside! 🎖️
```

### Monitoring Signups

To see who has joined your group:

1. Go to your group dashboard
2. Check the "Members" tab
3. New students appear within 1-2 minutes of successful signup

**Note**: If a student says they completed signup but doesn't appear after 5 minutes, ask them to try the link again.

---

## For Administrators

### Technical Details

**Architecture**:

- **Frontend**: Vue 3 + Nuxt 3 (page: `app/pages/signup/[groupId].vue`)
- **Backend**: Nuxt server endpoints (located in `server/api/onboard/`)
- **Database**: Entu API (group membership via `_parent` relationship)
- **Authentication**: Google OAuth 2.0 (via Entu)

**Flow**:

1. User clicks signup link: `/signup/{groupId}`
2. If not authenticated, redirect to Google OAuth
3. After OAuth, call `/api/onboard/join-group` (server endpoint)
4. Poll `/api/onboard/check-membership` every 2s for 30s
5. On confirmation, redirect to dashboard

**Key Configuration**:

```bash
# Required environment variables
ENTU_MASTER_ENTITY_ID=your-master-entity-id
ENTU_API_KEY=your-api-key
ENTU_WEBHOOK_KEY=your-webhook-key  # For join-group endpoint
```

### Security

**Webhook Authentication**:

The `/api/onboard/join-group` endpoint requires a webhook key to prevent unauthorized group assignments.

```typescript
// Server validates:
Authorization: Bearer ${ENTU_WEBHOOK_KEY}
```

**OAuth Scopes**:

The app only requests:

- `openid`: User identity
- `profile`: Display name
- `email`: Contact email (not stored long-term)

**Data Privacy**:

- No student data is stored outside Entu
- Google tokens are session-only
- No tracking or analytics on signup flow

### Monitoring & Logs

**Server logs** (enable verbose logging):

```bash
# Check for errors
grep "onboard-join-group" logs/server.log
grep "onboard-check-membership" logs/server.log
```

**Common issues**:

| Log Message | Meaning | Solution |
|-------------|---------|----------|
| "Invalid webhook key" | ENTU_WEBHOOK_KEY missing/wrong | Check environment variables |
| "Failed to assign user to group" | Entu API error | Check Entu service status |
| "User already has parent relationship" | Idempotent success | No action needed (normal) |

### Load Testing

**Expected load**:

- ~30 students per class
- ~5 classes per day
- ~150 signups per day

**API rate limits** (recommended):

- `/api/onboard/join-group`: 10 req/min per IP
- `/api/onboard/check-membership`: 60 req/min per IP (for 30s polling)

---

## Accessibility

The signup flow is fully accessible and meets **WCAG 2.1 Level AA** standards:

- ✅ **Keyboard navigation**: All buttons and links work with Tab and Enter
- ✅ **Screen readers**: ARIA labels and live regions announce all changes
- ✅ **Color contrast**: Text meets 4.5:1 ratio for readability
- ✅ **Touch targets**: All buttons are at least 44×44 pixels (mobile-friendly)

See [Accessibility Audit](../accessibility/onboarding-audit.md) for details.

---

## Multi-Language Support

The signup flow supports **4 languages**:

| Language | Code | Status |
|----------|------|--------|
| Estonian | `et` | ✅ Primary |
| English | `en` | ✅ Complete |
| Ukrainian | `uk` | ✅ Complete |
| Latvian | `lv` | ✅ Complete |

**For students**: The language is automatically detected from your browser settings.

**To change language manually**: Add `?lang=en` to the URL (replace `en` with your preferred language code).

---

## Related Documentation

- [API Documentation](../api/onboarding-endpoints.md)
- [FEAT-001 Specification](../../specs/030-student-onboarding-flow/spec.md)
- [Accessibility Audit](../accessibility/onboarding-audit.md)
- [Responsive Design Test](../testing/responsive-onboarding-test.md)

---

## Support

**For Students**: Contact your teacher  
**For Teachers**: Contact school IT administrator  
**For Administrators**: [Open a GitHub Issue](https://github.com/your-org/esmuseum-map-app/issues)

---

**Last Updated**: October 16, 2025  
**Version**: 1.0.0  
**Maintainer**: ESMuseum Development Team
