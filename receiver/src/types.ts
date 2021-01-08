// Structures that JSON can encode directly
export type JSONPrimitive = string | number | boolean | null | undefined;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = {[key: string]: JSONValue};
export type JSONArray = JSONValue[];

export interface HookData {
  userAgent?: string;
  sourceIp?: string;
  contentType: string;
  hookFlavor: string;
  hookId: string;

  receivedAt: Date;
  headers: Headers;
  parameters: URLSearchParams;

  payload?: JSONValue;
  payloadType?: string;
}
