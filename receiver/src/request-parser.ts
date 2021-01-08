import { ServerRequest, multiParser } from "./deps.ts";
import { HookData } from "./types.ts";

export async function handler(request: ServerRequest) {
  const {searchParams, pathname} = new URL(request.url, 'http://example.com');

  // make a labelled envelope
  const hook: HookData = {
    userAgent: request.headers.get('user-agent') ?? undefined,
    sourceIp: request.headers.get('x-forwarded-for') ?? ipFrom(request.conn.remoteAddr) ?? undefined,
    contentType: request.headers.get('content-type') ?? 'none?',
    hookFlavor: pathname.split('/').slice(2).join('/'),
    hookId: Math.random().toString(16).slice(2)+'-'+Date.now(),

    receivedAt: new Date,
    headers: request.headers,
    parameters: searchParams,
  };

  try {
    await attachPayload(hook, request);
    return hook;

  } finally {
    console.log('Hook envelope:', JSON.stringify([hook.hookFlavor, hook.sourceIp, hook.contentType, hook.payloadType, hook.hookId, hook.userAgent]));
  }
}

// Decode the inbound hook's body
async function attachPayload(hook: HookData, request: ServerRequest) {
  const baseContentType = hook.contentType.split(';')[0];
  switch (baseContentType) {

    case 'multipart/form-data': {
      const form = await multiParser(request);
      if (form) {
        const {fields, files} = form;
        hook.payload = fields;
        // TODO: store the files into s3
        // const filePrefix = (fields['Message-Id'] || Math.random().toString(36).slice(2));
        hook.payloadType = 'multipart-form';
        break;
      }
    }

    case 'application/x-www-form-urlencoded': {
      const rawData = new TextDecoder().decode(await Deno.readAll(request.body));
      const formData = new URLSearchParams(rawData);
      // detect an embedded json payload
      const payload = formData.get('payload');
      if (payload && payload[0] === '{') {
        hook.payload = JSON.parse(payload);
        hook.payloadType = 'urlencoded-json';
      } else {
        // this shouldn't really be used, it's a fallback
        hook.payload = makeStringRecord(formData.entries());
        hook.payloadType = 'urlencoded-form';
      }
      break;
    }

    case 'application/json': {
      const rawData = new TextDecoder().decode(await Deno.readAll(request.body));
      hook.payload = JSON.parse(rawData);
      hook.payloadType = 'json';
      break;
    }

    case 'text/plain': {
      const rawData = new TextDecoder().decode(await Deno.readAll(request.body));
      if (rawData[0] === '{') {
        hook.payload = JSON.parse(rawData);
        hook.payloadType = 'json';
      } else {
        hook.payload = {text: rawData};
        hook.payloadType = 'text';
      }
      break;
    }

    default: {
      throw new Error('TODO: Unsupported Content-Type: '+hook.contentType);
    }
  }
}

function ipFrom(addr: Deno.Addr) {
  if (addr.transport === 'tcp') {
    return addr.hostname;
  } else if (addr.transport === 'unix') {
    return 'file://'+addr.path;
  }
}

function makeStringRecord(items: IterableIterator<[string,string]>) {
  const req: Record<string,string> = Object.create(null);
  for (const item of items) {
    req[item[0]] = item[1];
  }
  return req;
}
