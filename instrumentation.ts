export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = async (
  err: Error,
  request: {
    method: string;
    headers: { [key: string]: string };
    url: string;
  },
  context: {
    routerKind: "Pages Router" | "App Router";
    routePath: string;
    routeType: "render" | "route" | "action" | "middleware";
  }
) => {
  await import("@sentry/nextjs").then(({ captureException }) => {
    captureException(err, {
      contexts: {
        request: {
          method: request.method,
          url: request.url,
        },
        router: {
          kind: context.routerKind,
          path: context.routePath,
          type: context.routeType,
        },
      },
    });
  });
};
