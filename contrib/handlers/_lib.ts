export type HookHandler = (ctx: HookContext, data: HookData<any>) => void | Promise<void>;

export interface HookContext {
  notify(channel: string, message: string): void;

  /** If the hook does't look anything like you expect,
   * mark it unrelated so it can proceed to the next script. */
  cancelAsUnrecognizable(message?: string): never;
  /** If the hook is from the right place, but has an incorrect detail
   * (bad signature, invalid field value) mark it as unprocessable.
   * This will not be automatically retried. */
  cancelAsMalformed(message?: string): never;

  // Nice lil helpers.
  shortenUrl(url: string): Promise<string>;
  trimText(text: string, maxLen: number): string;
}

export interface HookData<T=JSONValue> {
  sourceIp?: string;
  hookFlavor: string;
  hookId: string;

  receivedAt: Date;
  headers: Headers;
  parameters: URLSearchParams;

  payload: T;
  payloadType: string;
}


// Structures that JSON can encode directly
export type JSONPrimitive = string | number | boolean | null | undefined;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = {[key: string]: JSONValue};
export type JSONArray = JSONValue[];


// export interface Notification {
//   ver?: 1;
//   protocol?: string;
//   network?: string;
//   target: string;
//   message: string;
// }


// import { spawn } from 'child_process';
// import querystring from 'querystring';

// import { Notification } from "./_contract.ts";

// import fetch from 'node-fetch';
// import AWS from 'aws-sdk';

// // Allow injecting 'starnotify' options e.g. server URL
// import process from 'process';
// const {STARNOTIFY_FLAGS} = process.env;
// const extraFlags = STARNOTIFY_FLAGS ? STARNOTIFY_FLAGS.split(' ') : [];
// console.log('Using extra starnotify opts:', extraFlags);

// const sqs = new AWS.SQS();
// const s3 = new AWS.S3();

// await sleep(1000);
// export function sleep(ms: number) { return new Promise(ok => setTimeout(ok, ms)) };

// // shell out to starnotify
// export function notify(channel: string, message: string): Notification {
//   console.log('Sending to', channel, '-', message);

//   return { "ver": 1,
//     "protocol": "irc", "network": "freenode",
//     "target": channel, "message": message,
//   };
// };

// // export async function storeSpeciman(key: string, body) {
// //   const fullKey = `skyhook-specimans/${key}-${new Date().toISOString()}.json`;
// //   const url = `s3://stardust/${fullKey}`;
// //   console.log('storing speciman to', url);
// //   await s3.putObject({
// //     Bucket: 'stardust',
// //     Key: fullKey,
// //     Body: JSON.stringify(body, null, 2),
// //     ContentType: 'application/json',
// //   }).promise();
// //   return url;
// // }

// // support URL shortening through da.gd
// // never fails, just returns the long URL instead
// // const dagdUrl = process.env.DAGD_ROOT_URL || 'https://da.gd';
// const dagdUrl = 'https://da.gd';
// export async function shortenUrl(url: string) {
//   const fullUrl = new URL('/s?' + new URLSearchParams({url}).toString(), dagdUrl);
//   try {

//     const resp = await fetch(fullUrl, {
//       headers: {
//         accept: 'text/plain',
//       },
//     });
//     if (resp.status !== 200) {
//       throw new Error(`da.gd returned status code ${resp.status} ${resp.statusText}`);
//     }

//     const text = await resp.text();
//     if (!text.includes('://')) {
//       throw new Error(`da.gd response seemed bad: ${JSON.stringify(text)}`);
//     }

//     return text.trim();

//   } catch (err) {
//     console.log('WARN: could not shorten URL', url, '-', err.message);
//     return url;
//   }
// };

// export function trimText(text: string, maxLen: number) {
//   const cleaned = (text||'(n/a)').replace(/[\x00\x02\x03\x0F\x1F\x07\r]/g, '');
//   const lines = cleaned.split('\n');
//   const [firstLine] = lines;

//   if (lines.length > 1 || cleaned.length > maxLen) {
//     return firstLine.slice(0, maxLen-2)+'...';
//   }
//   return firstLine;
// }
