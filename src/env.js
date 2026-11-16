import { defineEnvVars } from '@sveltejs/kit/env';
import { building } from '$app/env';

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
	}
});
