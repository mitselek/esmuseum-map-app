# Feature F021: Structured Logging with Pino

## Status: ✅ IMPLEMENTED

## Overview

Upgraded the application's logging system from custom console-based logging to **Pino** - a high-performance, structured logging library. This provides better log management, searchability, and production readiness.

## Problem Statement

The previous custom logger had limitations:

- Console-based output not easily parsable
- No structured JSON logs for production
- Difficult to search and filter logs
- No built-in log rotation support
- Limited performance for high-throughput scenarios

## Solution

Replaced custom logger with **Pino** while maintaining backward compatibility:

### Key Features

✅ **Structured Logging**

- JSON logs in production (machine-readable)
- Pretty-printed colorized logs in development (human-readable)

✅ **High Performance**

- Pino is one of the fastest Node.js loggers
- Asynchronous logging minimizes impact on request handling

✅ **Backward Compatible**

- Maintains same `createLogger(module)` API
- Existing code works without changes
- Same methods: `debug`, `info`, `warn`, `error`

✅ **Production Ready**

- ISO timestamps for accurate log correlation
- Automatic log level management (debug in dev, info in prod)
- Works with log aggregation tools (PM2, Docker, Grafana Loki)

✅ **Better Developer Experience**

- Colorized output in development
- Module-based organization
- Clear log structure

## Implementation

### Dependencies Added

```json
{
  "pino": "^9.x",
  "pino-pretty": "^11.x"
}
```

### Logger Configuration

**Development Mode:**

- Pretty-printed, colorized output
- Shows: `HH:MM:SS LEVEL [module] message { context }`
- Debug level enabled for detailed logs

**Production Mode:**

- JSON structured logs
- ISO timestamps for precise timing
- Info level (debug logs filtered out)
- Ready for log aggregation systems

### API (Backward Compatible)

```typescript
import { createLogger } from "~/server/utils/logger";

const log = createLogger("webhook");

// Simple logging
log.info("Webhook received");

// With structured data
log.info("Webhook processed", {
  entityId: "123",
  duration: 850,
  permissionsGranted: 5,
});

// Error logging
log.error("Processing failed", error);

// Warning
log.warn("Token expiring soon", { expiresIn: 30 });

// Debug (dev only)
log.debug("Intermediate state", { state: "processing" });
```

### Log Output Examples

**Development (Pretty):**

```text
14:30:25 INFO [webhook] Webhook received entityId: "123"
14:30:25 INFO [entu-admin] Granting permissions count: 5
14:30:26 INFO [webhook] Processing completed duration: 850ms
```

**Production (JSON):**

```json
{"level":"info","time":"2025-10-02T14:30:25.123Z","module":"webhook","msg":"Webhook received","entityId":"123"}
{"level":"info","time":"2025-10-02T14:30:25.456Z","module":"entu-admin","msg":"Granting permissions","count":5}
{"level":"info","time":"2025-10-02T14:30:26.789Z","module":"webhook","msg":"Processing completed","duration":850}
```

## Benefits

### For Development

✅ **Easier Debugging**

- Colorized output makes logs easy to scan
- Structured data clearly separated from messages
- Module names show where logs originate

### For Production

✅ **Better Observability**

- JSON logs easily parsed by log aggregation tools
- Can filter by module, level, or custom fields
- Accurate timestamps for correlation

✅ **Performance**

- Minimal overhead even with high log volume
- Asynchronous logging doesn't block requests

✅ **Integration Ready**

- Works with PM2 log management
- Compatible with Docker logging drivers
- Ready for Grafana Loki, ELK stack, etc.

## Usage in Existing Code

All existing code continues to work without modification:

### Webhook Handlers

```typescript
const logger = createLogger("webhook:student-added");

logger.info("Webhook received", { entityId, userEmail });
logger.info("Processing completed", { duration, successful, skipped });
logger.error("Processing failed", error);
```

### Entu Admin Utilities

```typescript
const logger = createLogger("entu-admin");

logger.info("Granting permissions", { entityId, personId });
logger.warn("Permission already exists", { entityId, personId });
logger.error("API call failed", apiError);
```

## Log Management

### Development

Logs appear in console with pretty formatting. No additional setup needed.

### Production with PM2

PM2 automatically captures logs:

```bash
# View logs
pm2 logs

# View specific app logs
pm2 logs esmuseum-app

# Save logs to files
pm2 install pm2-logrotate
```

Logs saved to:

- `~/.pm2/logs/app-out.log` - stdout (info, debug)
- `~/.pm2/logs/app-error.log` - stderr (error, warn)

### Production with Docker

Docker captures logs via logging driver:

```bash
# View logs
docker logs esmuseum-app

# Stream logs
docker logs -f esmuseum-app

# JSON logs work with any Docker logging driver
```

### Manual Log Rotation

If not using PM2/Docker, use logrotate:

```bash
# /etc/logrotate.d/esmuseum-app
/var/log/esmuseum-app/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    missingok
    create 0640 www-data www-data
}
```

## Migration Notes

### What Changed

✅ **Replaced**: Custom logger implementation with Pino
✅ **Maintained**: Same `createLogger(module)` API
✅ **Improved**: Log output format and performance
✅ **Added**: Structured JSON logs for production

### What Stayed the Same

✅ Module-based logging
✅ Log levels (debug, info, warn, error)
✅ Method signatures
✅ Existing code works without changes

### Breaking Changes

**None** - Fully backward compatible!

## Future Enhancements

### Phase 2 (Optional): Log Aggregation

**Option A: Self-hosted with Grafana Loki**  

- Centralized log storage
- Powerful querying with LogQL
- Integration with Grafana dashboards

**Option B: Cloud service (Sentry, Better Stack)**  

- Error tracking with alerts
- Log searching and filtering
- Email/Slack notifications

### Phase 3 (Optional): Enhanced Context

Add automatic context to all logs:

- Request ID for tracing
- User ID when available
- Performance metrics

```typescript
// Future: Automatic request correlation
logger.info("Processing webhook", {
  requestId: event.context.requestId,
  userId: event.context.userId,
  // ... other data
});
```

## Testing

### Verify Pretty Logs in Development

```bash
npm run dev
```

Trigger a webhook and see colorized output:

```text
14:30:25 INFO [webhook:student-added] Webhook received entityId: "123", userEmail: "user@example.com"
```

### Verify JSON Logs in Production

```bash
NODE_ENV=production npm run start
```

Logs should be JSON:

```json
{
  "level": "info",
  "time": "2025-10-02T14:30:25.123Z",
  "module": "webhook:student-added",
  "msg": "Webhook received",
  "entityId": "123"
}
```

## Success Metrics

✅ **Performance**: No noticeable impact on response times
✅ **Compatibility**: All existing code works without changes
✅ **Readability**: Logs easier to read in development
✅ **Parsability**: JSON logs in production ready for analysis

## Related Documentation

- **Pino Documentation**: <https://getpino.io/>
- **Logger Utility**: `server/utils/logger.ts`
- **Usage Examples**: Webhook handlers, entu-admin utilities

## Conclusion

Feature F021 successfully upgrades the logging system to use Pino while maintaining complete backward compatibility. All existing code continues to work, but now benefits from:

- High-performance structured logging
- Better development experience with pretty printing
- Production-ready JSON logs
- Easy integration with log management tools

No code changes required in application logic - just better logging under the hood! 📝✨
