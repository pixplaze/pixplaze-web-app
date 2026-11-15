import { defineEnvVars } from '@sveltejs/kit/env';

const required = (input, name) => {
	if (!input) {
		throw new Error('Environment variable \''+ name + '\' is not specified!');
	}

	return input;
}

export const variables = defineEnvVars({
	PIXPLAZE_WEB_API_URL: {
		static: true,
		public: true,
		schema: (input) => required(input, 'PIXPLAZE_WEB_API_URL')
	}
});
