import { DrizzleD1Database } from 'drizzle-orm/d1';
import { getHostDomain } from '..';
import * as schema from '$lib/db/schema';
import { inArray } from 'drizzle-orm';
import { PUBLIC_AUTH_URL } from '../publicConstants';

export type ConsentValue = 'public' | 'private' | boolean;
export type ConsentKeys =
	| 'name_visibility'
	| 'email_visibility'
	| 'show_location'
	| 'marketing_opt_in'
	| 'phone_visibility';
export type ConsentSituation = 'profile' | 'bg_job' | 'minimal_profile';

export const USER_CONSENTS: Record<ConsentKeys, ConsentValue> = {
	name_visibility: 'public',
	email_visibility: 'public',
	show_location: 'private',
	marketing_opt_in: false,
	phone_visibility: 'private'
};

export const DEFAULTS_TO_FETCH: Record<ConsentSituation, ConsentKeys[]> = {
	minimal_profile: ['name_visibility', 'email_visibility'],
	profile: ['name_visibility', 'email_visibility', 'show_location'],
	bg_job: ['marketing_opt_in', 'phone_visibility']
};

export const ANONYMOUS_VALUES = {
	name: 'Anonymous',
	email: `anonymous@${getHostDomain(PUBLIC_AUTH_URL || '')}`
};

export async function getUserConsents(
	db: DrizzleD1Database<typeof schema>,
	situation: ConsentSituation
): Promise<Record<ConsentKeys, ConsentValue>> {
	const consentKeys = DEFAULTS_TO_FETCH[situation];

	if (!consentKeys?.length) return USER_CONSENTS;

	const rows = await db
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
