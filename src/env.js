import {defineEnvVars} from '@sveltejs/kit/env';
import {building} from '$app/env';

const required = (input, name) => {
	if (!building && !input) {
		throw new Error('Environment variable \''+ name + '\' is not specified!');
	}

	return input;
}

export const variables = defineEnvVars({
	PIXPLAZE_WEB_API_URL: {
		static: false,
		public: true,
		schema: (input) => required(input, 'PIXPLAZE_WEB_API_URL')
	},
	PUBLIC_WEB_PUSH_ENABLED: {
		public: true,
		schema: (value) => (value?.trim().toLowerCase() === 'true' ? 'true' : 'false')
	},
	PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY: {
		public: true,
		schema: (value) => value?.trim() ?? ''
	},
	PUBLIC_WEB_PUSH_SUBSCRIPTIONS_PATH: {
		public: true,
		schema: (value) =>
			value?.trim() || '/notifications/subscriptions'
	}
});
