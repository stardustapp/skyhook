// This is a DataTree schema
// For more info, visit https://www.npmjs.com/package/@dustjs/data tree

export const metadata = {
  AppName: 'Inbound Webhooks',
  Author: 'Daniel Lamando',
  Audience: 'Sysadmins',
  License: 'MIT',
};
export function builder(El, addRoot) {

  addRoot(new El.AppRegion('config', {
    '/prefs': new El.Document({
      // '/hook url base': String,
    }),

    '/scripts': new El.Collection({
      '/title': String,
      '/description': String,
      '/visibility': String,
      '/upstream url': String,
      '/license': String,
      '/runtime': String, // deno

      // '/created at': Date,
      // '/updated at': Date,

      '/latest generation': Number,

      // TODO: immutable
      '/generations': new El.NamedCollection({
        '/created at': Date,
        '/source': new El.Blob(),

        '/options': new El.StringMap({
          '/required': Boolean,
          '/description': String,
        }),
      }),
    }),

  }));

  addRoot(new El.AppRegion('persist', {

    '/hooks': new El.NamedCollection({
      '/title': String,
      '/is enabled': Boolean,
      '/created at': Date,

      '/url shortener': String,
      '/destination': {
        '/protocol': String,
        '/network': String,
        '/channel': String,
        '/sender name': String,
        '/message type': String,
        // List of fields that can be changed dynamically (by script) or ['all']
        '/allow dynamic': new El.List(String),
      },

      '/handlers': new El.StringMap({
        '/script url': String,
        '/script generation': Number,
        '/continue processing': Boolean,
        '/sender name': String,
        '/script options': new El.StringMap(String),
      }),
      '/handler order': new El.List(String),

      '/history': new El.NamedCollection({
        '/is completed': Boolean,
        '/completed at': Date,
        '/error': String,
        '/handled by': new El.List(String),
        '/input': {
          '/User agent': String,
          '/Source IP': String,
          '/Content type': String,
          '/Hook flavor': String,
          '/Hook ID': String,
          '/Received at': Date,
          '/Headers': new El.StringMap(String),
          '/Parameters': new El.StringMap(String),
          '/Payload': String,
          '/Payload type': String,
        },
      }),
    }),

  }));

}
