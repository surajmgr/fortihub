<script lang="ts">
	import { authClient } from '$lib/auth/authClient';
	import { updateConsent } from '$lib/auth/authHandlers';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import AlertMessage from '$lib/components/ui/AlertMessage.svelte';
	import type { ConsentKeys, ConsentConfigItem } from '$lib/utils/server/defaults';

	let { data } = $props();
	let { user, consents, consentConfig } = data;

	let displayName = $state(user?.name || '');
	// Create local state for consents to handle optimistic UI and binding
	let localConsents = $state({ ...consents });

	let isLoading = $state(false);
	let message: { type: 'success' | 'error'; text: string } = $state({
		type: 'success',
		text: ''
	});

	async function handleUpdateProfile() {
		isLoading = true;
		message.text = '';
		try {
			await authClient.updateUser({
				name: displayName
			});
			message = { type: 'success', text: 'Profile updated successfully.' };
		} catch (e) {
			message = { type: 'error', text: 'Failed to update profile.' };
		} finally {
			isLoading = false;
		}
	}

	async function handleConsentChange(key: string, value: string) {
		// Update local state immediately
		// @ts-ignore
		localConsents[key] = value;

		try {
			await updateConsent({
				input: {
					key,
					value
				}
			});
		} catch (e) {
			console.error(e);
			// Ideally revert local state here on error
		}
	}
</script>

<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-2xl mx-auto space-y-8">
		<div>
			<h2 class="text-3xl font-extrabold text-gray-900">Account Settings</h2>
			<p class="mt-2 text-sm text-gray-600">Manage your profile and preferences.</p>
		</div>

		<!-- Profile Section -->
		<div class="bg-white shadow rounded-lg p-6 border border-gray-100">
			<h3 class="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="email">Email</label>
					<Input id="email" value={user?.email || ''} disabled class="bg-gray-50 text-gray-500" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="name">Display Name</label
					>
					<Input id="name" bind:value={displayName} />
				</div>
				<div class="pt-2">
					<Button onclick={handleUpdateProfile} disabled={isLoading}>
						{isLoading ? 'Saving...' : 'Save Changes'}
					</Button>
				</div>
				{#if message.text}
					<AlertMessage type={message.type} message={message.text} />
				{/if}
			</div>
		</div>

		<!-- Dynamic Preferences Section -->
		<div class="bg-white shadow rounded-lg p-6 border border-gray-100">
			<h3 class="text-lg font-medium text-gray-900 mb-4">Privacy & preferences</h3>

			<div class="space-y-6">
				{#each Object.entries(consentConfig) as [key, config]}
					{#if config.type === 'boolean'}
						<Toggle
							label={config.label}
							checked={localConsents[key as ConsentKeys] === 'true'}
							onchange={(checked) => handleConsentChange(key as ConsentKeys, String(checked))}
						/>
					{:else if config.type === 'select' && config.options}
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1" for={key}>
								{config.label}
							</label>
							<select
								id={key}
								value={localConsents[key as ConsentKeys]}
								onchange={(e) => handleConsentChange(key as ConsentKeys, e.currentTarget.value)}
								class="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-white"
							>
								{#each config.options as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
							{#if config.description}
								<p class="mt-1 text-xs text-gray-500">{config.description}</p>
							{/if}
						</div>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Security Section -->
		<div class="bg-white shadow rounded-lg p-6 border border-gray-100">
			<h3 class="text-lg font-medium text-gray-900 mb-4">Security</h3>
			<p class="text-sm text-gray-500 mb-4">
				To change your password or manage other security settings.
			</p>
			<Button variant="outline" onclick={() => (window.location.href = '/forgot-password')}>
				Reset Password
			</Button>
		</div>

		<div class="flex justify-center">
			<Button
				variant="link"
				class="text-red-500"
				onclick={() => authClient.signOut().then(() => (window.location.href = '/login'))}
			>
				Sign Out
			</Button>
		</div>
	</div>
</div>
