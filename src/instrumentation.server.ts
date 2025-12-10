import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: 'https://91dd7f10057c421c3f7943c94d034ad7@o4510504084111360.ingest.de.sentry.io/4510504458715216',

	tracesSampleRate: 1.0,

	integrations: [
		Sentry.consoleLoggingIntegration({
			levels: ['error']
		})
	],

	// Enable logs to be sent to Sentry
	enableLogs: true

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
});
