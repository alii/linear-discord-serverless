import {api} from 'nextkit';
import zodToJsonSchema from 'zod-to-json-schema';
import {bodySchema} from '../v2-util/schema';

export default api({
	async GET() {
		return zodToJsonSchema(bodySchema, 'body');
	},
});
