// Cloudflare Workers 类型声明（避免安装 @cloudflare/workers-types 依赖）

declare interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

declare type RouteHandler = (
  request: Request,
  params?: Record<string, string>
) => Response | Promise<Response>;
