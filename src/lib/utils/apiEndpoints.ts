import { getAuthURL } from './utils';

export const apiEndpoints = {
	auth: {
		getSession: () => getAuthURL('/api/auth/get-session'),
		checkHasPassword: () => getAuthURL('/api/server/checkHasPassword'),
		setPassword: () => getAuthURL('/api/server/setPassword')
	}
};
