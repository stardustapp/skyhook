import { WireType, WireRequest } from "./deps.ts";
import { HookData } from "./types.ts";
import { fetchServiceAccountToken } from './metadata-server.ts';

export function submitHook(hookData: HookData) {
  return pushFrame({
    Op: 'invoke',
    Path: '/process hook',
    Input: {
      Type: 'Folder',
      Name: 'Hook',
      Children: [
        // { Type: 'String', Name: 'User agent', StringValue: hookData.userAgent },
        { Type: 'String', Name: 'Source IP', StringValue: hookData.sourceIp },
        // { Type: 'String', Name: 'Content type', StringValue: hookData.contentType },
        { Type: 'String', Name: 'Hook flavor', StringValue: hookData.hookFlavor },
        { Type: 'String', Name: 'Hook ID', StringValue: hookData.hookId },

        { Type: 'String', Name: 'Received at', StringValue: hookData.receivedAt.toISOString() },
        { Type: 'Folder', Name: 'Headers', Children: writeChildren(hookData.headers.entries()) },
        { Type: 'Folder', Name: 'Parameters', Children: writeChildren(hookData.parameters.entries()) },

        { Type: 'String', Name: 'Payload', StringValue: JSON.stringify(hookData.payload) },
        { Type: 'String', Name: 'Payload type', StringValue: hookData.payloadType },
      ],
    }});
}

// import { ServiceAccount } from "https://danopia.net/deno/google-service-account@v1.ts";
// const credential = await ServiceAccount.readFromFile("../../my-deployments/stardust-skyhook/firebase-service-account.json");
// const token = await credential.issueToken("https://www.googleapis.com/auth/datastore");

// project id can probably come from elsewhere?
const projectId = Deno.env.get('RECEIVER_PROJECT_ID');
if (!projectId) throw new Error(`Envvar RECEIVER_PROJECT_ID is required`);
const collectionPath = Deno.env.get('RECEIVER_FRAME_COLLECTION') ?? '/frames';

async function pushFrame(request: WireRequest) {
  // TODO: try talking directly over HTTP before falling back to fireproxy

  // TODO: cache token for some time
  const token = await fetchServiceAccountToken(['https://www.googleapis.com/auth/datastore']);

  // TODO: send metrics to Datadog
  // Datadog.countFireOp('write', frameCollRef, {fire_op: 'add', method: 'service/request'});
  const doc = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents${collectionPath}`, {
      method: 'POST',
      body: JSON.stringify({
        fields: {
          state: { stringValue: 'Waiting' },
          request: { mapValue: { fields: {
            Op: { stringValue: request.Op },
            Path: { stringValue: request.Path },
            Input: { stringValue: JSON.stringify(request.Input ?? null) },
          }}},
          origin: { mapValue: { fields: {
            hostname: { stringValue: Deno.hostname() },
            wantsResponse: { booleanValue: false },
            date: { timestampValue: new Date().toISOString() },
          }}},
        },
      }),
      headers: {
        authorization: `Bearer ${token.access_token}`,
      },
    }).then(x => x.json());

  if (doc.error) {
    console.log(doc.error.code, doc.error.status, doc.error.details);
    throw new Error(doc.error.message ?? 'Firestore Error');
  }

  console.log("Created", doc.name);
}

function writeChildren(entries: IterableIterator<[string,string]>): Array<WireType> {
  return Array.from(entries).map(([k,v]) => ({
    Type: 'String',
    Name: k,
    StringValue: v,
  }));
}
