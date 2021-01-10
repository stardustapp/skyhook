
Vue.component('recent-hooks', {
  template: '#recent-hooks',
});

Vue.component('recent-hook', {
  template: '#recent-hook',
  props: {
    entry: Object,
  },
  computed: {
    input() {
      if (!this.entry.request?.Input) return {};
      return JSON.parse(this.entry.request.Input);
    },
    output() {
      if (!this.entry.response?.Output) return {};
      return JSON.parse(this.entry.response.Output);
    },
    status() {
      if (typeof this.entry.state == 'string' && this.entry.state !== 'Done') {
        return { level: 'trace', text: this.entry.state || 'Missing' };
      } else if (this.entry.response?.Ok == 'yes') {
        return { level: 'info', text: `OK` };
      } else if (this.entry.response?.Ok == 'no') {
        return { level: 'error', text: `Failed` };
      } else if (typeof this.entry.state == 'string') {
        return { level: 'trace', text: this.entry.state || 'Missing' };
      } else {
        return { level: 'warn', text: `Unknown` };
      }
    },
    formattedDate() {
      // TODO: refresh
      if (!this.entry.origin?.date) return 'UNKNOWN'
      const date = new Date(this.entry.origin.date);
      const hoursAgo = (Date.now() - date.valueOf()) / 1000 / 60 / 60;

      if (hoursAgo < 12) return new Intl
        .DateTimeFormat('default', {
          timeStyle: 'short',
        }).format(date);

      return new Intl
        .DateTimeFormat('default', {
          dateStyle: 'short',
        }).format(date);
    }
  },
  methods: {

    // error, warn, info, debug, trace
    levelKey(ent) {
      if (!ent.Response) return '';
      return ent.Response.Ok ? 'info' : 'warn'
    },

    entryToJS: DustClient.entryToJS,

  },
});
