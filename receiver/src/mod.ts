import { serve } from "./deps.ts";
import { handler } from './request-parser.ts';
import { submitHook } from './submission.ts';

const port = parseInt(Deno.env.get('PORT') ?? '8080');
const server = serve({ hostname: "0.0.0.0", port });
console.log(`HTTP server running on port ${port}`);

for await (const request of server) {

  console.log(request.method, request.url);

  if (request.method === 'POST' && request.url.match(/^\/hooks\/.+/)) {
    handler(request)
      .then(submitHook)
      .then(data => {
        request.respond({ status: 200, body: JSON.stringify(data, null, 2) });
        // request.respond({ status: 200, body: 'thx <3' });
      }, err => {
        console.log('REQUEST CRASH:', err.stack);
        request.respond({ status: 500, body: err.stack || err || "oops!" });
      });
    continue;
  }

  request.respond({
    status: 303,
    headers: new Headers({
      'Location': 'https://devmode.cloud/docs/webhooks.html',
    }),
    body: 'Documentation @ https://devmode.cloud/docs/webhooks.html',
  });
}
