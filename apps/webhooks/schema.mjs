// This is a DataTree schema
// For more info, visit https://www.npmjs.com/package/@dustjs/data-tree

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
      '/visibility': String,
      '/upstream url': String,
      '/license': String,

      // '/created at': Date,
      // '/updated at': Date,

      '/generation': Number,
      '/source': new El.Blob(),
    }),

  }));

  addRoot(new El.AppRegion('persist', {

    '/routes': new El.Collection({
      '/url path': String,
      '/script id': String,

      '/is enabled': Boolean,
      '/created at': Date,
      '/last used at': Date,

      '/history': new El.Collection({
        '/is completed': Boolean,
        '/completed at': Date,
        '/error': String,
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
