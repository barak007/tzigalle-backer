"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="he" dir="rtl">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h2 className="mb-4 text-2xl font-bold">משהו השתבש</h2>
            <p className="mb-6 text-muted-foreground">
              אירעה שגיאה בלתי צפויה. אנחנו עובדים על תיקון הבעיה.
            </p>
            <Button onClick={() => reset()}>נסה שוב</Button>
          </div>
        </div>
      </body>
    </html>
  );
}
