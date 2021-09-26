import {createAPIWithHandledErrors} from 'nextkit';

export const api = createAPIWithHandledErrors((req, res, err) => {
	console.log(`An error occurred in ${req.url}`, err);

	res.json({
		success: false,
		data: null,
		message: 'Something has gone wrong!',
	});
});
