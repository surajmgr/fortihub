import { DrizzleD1Database } from 'drizzle-orm/d1';
import { getHostDomain } from '..';
import * as schema from '$lib/db/schema';
import { inArray } from 'drizzle-orm';
import { PUBLIC_AUTH_URL } from '../publicConstants';
import db from '$lib/db';

export type ConsentValue = 'public' | 'private' | 'true' | 'false';
export type ConsentKeys =
	| 'name_visibility'
	| 'email_visibility'
	| 'show_location'
	| 'marketing_opt_in'
	| 'phone_visibility';
export type ConsentSituation = 'all' | 'profile' | 'bg_job' | 'minimal_profile';

export const USER_CONSENTS: Record<ConsentKeys, ConsentValue> = {
	name_visibility: 'public',
	email_visibility: 'public',
	show_location: 'private',
	marketing_opt_in: 'true',
	phone_visibility: 'private'
};

export const DEFAULTS_TO_FETCH: Record<ConsentSituation, ConsentKeys[]> = {
	minimal_profile: ['name_visibility', 'email_visibility'],
	profile: ['name_visibility', 'email_visibility', 'show_location'],
	bg_job: ['marketing_opt_in', 'phone_visibility'],
	all: Object.keys(USER_CONSENTS) as ConsentKeys[]
};

export const ANONYMOUS_VALUES = {
	name: 'Anonymous',
	email: `anonymous@${getHostDomain(PUBLIC_AUTH_URL || '')}`
};

export async function getUserConsents(
	situation: ConsentSituation
): Promise<Record<ConsentKeys, ConsentValue>> {
	const consentKeys = DEFAULTS_TO_FETCH[situation];

	if (!consentKeys?.length) return USER_CONSENTS;

	const dbInstance = db();
	if (!dbInstance) throw new Error('DB instance not found');

	const rows = await dbInstance
		.select()
		.from(schema.userConsents)
		.where(inArray(schema.userConsents.key, consentKeys));

	const result: Record<ConsentKeys, ConsentValue> = consentKeys.reduce(
		(acc, key) => {
			acc[key] = USER_CONSENTS[key];
			return acc;
		},
		{} as Record<ConsentKeys, ConsentValue>
	);

	for (const row of rows) {
		result[row.key as ConsentKeys] = row.value as ConsentValue;
	}

	return result;
}

export interface ConsentOption {
	label: string;
	value: string;
}

export interface ConsentConfigItem {
	label: string;
	description?: string;
	type: 'boolean' | 'select';
	options?: ConsentOption[];
}

export const CONSENT_CONFIG: Record<ConsentKeys, ConsentConfigItem> = {
	name_visibility: {
		label: 'Name Visibility',
		type: 'select',
		options: [
			{ label: 'Public', value: 'public' },
			{ label: 'Private', value: 'private' }
		]
	},
	email_visibility: {
		label: 'Email Visibility',
		type: 'select',
		options: [
			{ label: 'Public', value: 'public' },
			{ label: 'Private', value: 'private' }
		]
	},
	show_location: {
		label: 'Show Location',
		type: 'select',
		options: [
			{ label: 'Public', value: 'public' },
			{ label: 'Private', value: 'private' }
		]
	},
	marketing_opt_in: {
		label: 'Receive marketing emails',
		type: 'boolean'
	},
	phone_visibility: {
		label: 'Phone Visibility',
		type: 'select',
		options: [
			{ label: 'Public', value: 'public' },
			{ label: 'Private', value: 'private' }
		]
	}
};
