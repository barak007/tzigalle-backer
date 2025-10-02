# Sentry Error Tracking Setup

This project uses Sentry for production error tracking and monitoring.

## 🚀 Quick Setup

### 1. Create a Sentry Account

1. Go to [sentry.io](https://sentry.io) and sign up
2. Create a new project and select **Next.js**
3. Copy your DSN (Data Source Name)

### 2. Configure Environment Variables

Create a `.env.local` file (or add to your existing one):

```bash
# Required: Sentry DSN
NEXT_PUBLIC_SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id

# Optional: For automatic source map uploads in CI/CD
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token
```

### 3. Test the Setup

Run your development server:

```bash
npm run dev
```

Sentry is now configured and will automatically:

- ✅ Capture uncaught exceptions
- ✅ Track console errors and warnings
- ✅ Monitor API route errors
- ✅ Record user sessions on error (in client)
- ✅ Log errors with full context from your `logError` utility

## 📊 What's Configured

### Client-Side (`sentry.client.config.ts`)

- Error tracking
- Session replay on errors
- Console logging integration
- Performance monitoring

### Server-Side (`sentry.server.config.ts`)

- Server action error tracking
- API route error tracking
- Console logging integration
- Performance monitoring

### Edge Runtime (`sentry.edge.config.ts`)

- Edge function error tracking
- Middleware error tracking

### Instrumentation (`instrumentation.ts`)

- Automatic error capture for all requests
- Context enrichment with route and request details

## 🔧 Usage Examples

### Automatic Error Tracking

Errors are automatically tracked in your server actions via the `logError` utility:

```typescript
import { logError } from "@/lib/utils/error-handler";

try {
  // Your code
} catch (error) {
  logError(error, {
    action: "createOrder",
    userId: user.id,
    data: { orderId: order.id },
  });
}
```

### Manual Error Capture

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: "checkout",
    },
    extra: {
      orderId: "123",
    },
  });
}
```

### Performance Monitoring

Track button clicks:

```typescript
import * as Sentry from "@sentry/nextjs";

function handleSubmit() {
  Sentry.startSpan(
    {
      op: "ui.click",
      name: "Submit Order",
    },
    (span) => {
      span.setAttribute("items", orderItems.length);
      span.setAttribute("totalPrice", totalPrice);

      // Your submit logic
    }
  );
}
```

Track API calls:

```typescript
async function fetchOrders(userId: string) {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: "GET /api/orders",
    },
    async () => {
      const response = await fetch(`/api/orders?userId=${userId}`);
      return response.json();
    }
  );
}
```

### Logging

```typescript
import * as Sentry from "@sentry/nextjs";

const { logger } = Sentry;

// Different log levels
logger.info("Order created successfully", { orderId: "123" });
logger.warn("Rate limit approaching", { userId: "user_123" });
logger.error("Payment failed", { orderId: "123", error: "timeout" });

// Using template literals
logger.debug(logger.fmt`Cache miss for user: ${userId}`);
```

## 🎯 Best Practices

1. **Don't Log Sensitive Data**: Avoid logging passwords, tokens, or personal information
2. **Use Contextual Data**: Add relevant tags and extra data to help debug issues
3. **Set User Context**: Already configured in `logError` utility
4. **Monitor in Development**: Test error tracking in dev mode first
5. **Check Sentry Dashboard**: Regularly review errors and performance issues

## 📈 Vercel Integration

If deploying to Vercel:

1. Add environment variables in Vercel dashboard
2. Sentry will automatically track Vercel Cron Monitors (if you use cron jobs)
3. Source maps are automatically hidden in production for security

## 🔗 Useful Links

- [Sentry Dashboard](https://sentry.io)
- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)

## 🧪 Testing Error Tracking

To test if Sentry is working, you can temporarily add a test error:

```typescript
// In any page or component
import * as Sentry from "@sentry/nextjs";

// Throw a test error
Sentry.captureException(new Error("Test error from Next.js app"));
```

Check your Sentry dashboard to see if the error appears!

## 🛡️ Privacy & Performance

- Session replay masks all text and media by default (client-side only)
- 10% of sessions are recorded (configurable)
- Errors in those sessions are always recorded
- Source maps are hidden from public bundles
- Console logging only captures warnings and errors

## 📝 Notes

- The error tracking is integrated with your existing `logError` utility
- All server action errors are automatically tracked
- Rate limiting errors include user context for debugging
- Authentication errors are captured with relevant context
