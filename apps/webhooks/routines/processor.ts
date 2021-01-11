import {
  BlobEntry, Entry, FolderEntry, StringEntry,
  Environment, FunctionDevice,
  FunctionEntry,
// } from "https://uber.danopia.net/deno/dust@v1beta1/skylink/src/mod.ts";
} from "../../../../dust-typescript/skylink/src/mod.ts";
// import { AutomatonBuilder, Automaton, ApiHandle } from "https://uber.danopia.net/deno/dust@v1beta1/client-automaton/mod.ts";
import { AutomatonBuilder, Automaton, ApiHandle } from "../../../../dust-typescript/client-automaton/mod.ts";

class WebhookProcessorRuntime {
  config: ApiHandle;
  data: ApiHandle;
  constructor(automaton: Automaton<WebhookProcessorRuntime>) {
    this.config = automaton.getHandle(`/blog-config`);
    this.data = automaton.getHandle(`/blog-data`);

    this.env = new Environment;
    this.env.bind('/process hook', { getEntry: (path: string) => {
      if (path != '') throw new Error(`Not found: ${path}`)
      return {
        get: () => Promise.resolve(new FunctionEntry('invoke')),
        invoke: input => this.processWebhook(input),
      };
    }});
  }
  env: Environment;

  async processWebhook(input: Entry | null) {
    if (input?.Type !== 'Folder') throw new Error(`4XX: expected Folder`);

    const hook: HookData = {
      sourceIp: input.getStringChild('Source IP', true),
      hookFlavor: input.getStringChild('Hook flavor', true),
      hookId: input.getStringChild('Hook ID', true),
      receivedAt: new Date(input.getStringChild('Received at', true)),
      headers: new Headers((input.getChild('Headers', true, 'Folder') as FolderEntry).toDictionary(x => x.Type === 'String' ? x.StringValue : '')),
      parameters: new URLSearchParams((input.getChild('Parameters', true, 'Folder') as FolderEntry).toDictionary(x => x.Type === 'String' ? x.StringValue : '')),
      payload: JSON.parse(input.getStringChild('Payload', true)),
      payloadType: input.getStringChild('Payload type', true),
    };

    console.log(hook);

    throw new Error(`TODO`)
    return new StringEntry('result', 'ok');
  }

  async runNow() {

    console.log('Infinite loop!');
    while (true) {
      await new Promise(ok => setTimeout(ok, 60*1000));
    }

    // const startTime = Date.now();

    // console.log('Loading blog configuration...');
    // // const config = await getChildrenOf(this.config.subPath`/prefs`, 3);
    // // const prefs = readStructure(config);

    // const endTime = Date.now();
    // const elapsedSecs = Math.round((endTime - startTime) / 1000);
    // console.log('Blog published in', elapsedSecs, 'seconds :)');

  }
}


// async function getChildrenOf(path: ApiHandle, depth: number) {
//   const output = await path.enumerateToLiteral({Depth: depth});
//   if (output.Type !== 'Folder') throw new Error(`BUG`);
//   return output.Children;
// }

// function readStructure(children: Entry[]) {
//   const data: Record<string,string> = {};
//   for (const child of children) {
//     if (child.Type !== 'String') continue;
//     data[child.Name.replace(/ [a-z]/g, x => x[1].toUpperCase())] = child.StringValue;
//   }
//   return data;
// }

// function readMap<T>(children: Entry[], reader: (children: Entry[]) => T): Map<string,T> {
//   const data: Map<string,T> = new Map;
//   for (const child of children) {
//     if (child.Type !== 'Folder') continue;
//     data.set(child.Name, reader(child.Children));
//   }
//   return data;
// }

new AutomatonBuilder<WebhookProcessorRuntime>()
  .withMount('/config/webhooks', 'session:/config/webhooks')
  .withMount('/persist/webhooks', 'session:/persist/webhooks')
  .withRuntimeConstructor(WebhookProcessorRuntime)
  .withServicePublication('processor')
  .launch();




// Structures that JSON can encode directly
export type JSONPrimitive = string | number | boolean | null | undefined;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONObject = {[key: string]: JSONValue};
export type JSONArray = JSONValue[];

export interface HookData {
  sourceIp?: string;
  hookFlavor: string;
  hookId: string;

  receivedAt: Date;
  headers: Headers;
  parameters: URLSearchParams;

  payload?: JSONValue;
  payloadType?: string;
}
