export type RouteHandler = (request: Request, params: Record<string, string>) => Response | Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  handler: RouteHandler;
  paramNames: string[];
}

export class Router {
  private routes: Route[] = [];

  get(path: string, handler: RouteHandler) {
    this.add('GET', path, handler);
  }

  post(path: string, handler: RouteHandler) {
    this.add('POST', path, handler);
  }

  all(path: string, handler: RouteHandler) {
    this.add('*', path, handler);
  }

  private add(method: string, path: string, handler: RouteHandler) {
    const paramNames: string[] = [];
    // Convert :param to regex capture groups
    const regexPattern = path
      .replace(/:([^/]+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
      })
      .replace(/\*/g, '.*');

    this.routes.push({
      method,
      pattern: new RegExp(`^${regexPattern}$`),
      handler,
      paramNames
    });
  }

  async handle(request: Request, pathname: string): Promise<Response> {
    const method = request.method;

    for (const route of this.routes) {
      if (route.method !== '*' && route.method !== method) continue;

      const match = pathname.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });

        try {
          return await route.handler(request, params);
        } catch (error) {
          return new Response(JSON.stringify({
            error: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }

    return new Response(JSON.stringify({
      error: 'NOT_FOUND',
      message: `No route found for ${method} ${pathname}`
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
