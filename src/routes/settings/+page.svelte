<script lang="ts">
	import { authClient } from '$lib/auth/authClient';
	import { updateConsent } from '$lib/auth/authHandlers';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import AlertMessage from '$lib/components/ui/AlertMessage.svelte';

	let { data } = $props();
	let { user, consents } = data;

	let displayName = $state(user?.name || '');
	let marketingOptIn = $state(
		consents.find((c: { key: string; value: string }) => c.key === 'marketing_opt_in')?.value ===
			'true'
	);

	let isLoading = $state(false);
	let message: { type: 'success' | 'error'; text: string } = $state({ type: 'success', text: '' });

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

	async function handleConsentChange(checked: boolean) {
		try {
			await updateConsent({
				input: {
					key: 'marketing_opt_in',
					value: String(checked)
				}
			});
		} catch (e) {
			console.error(e);
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

		<!-- Preferences Section -->
		<div class="bg-white shadow rounded-lg p-6 border border-gray-100">
			<h3 class="text-lg font-medium text-gray-900 mb-4">Email Preferences</h3>
			<Toggle
				label="Receive marketing emails and updates"
				bind:checked={marketingOptIn}
				onchange={handleConsentChange}
			/>
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
