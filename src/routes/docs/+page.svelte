<script lang="ts">
	import { ArrowRight } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Documentation - FortiHub</title>
	<meta name="description" content="Documentation for FortiHub Authentication Service" />
</svelte:head>

<div class="min-h-screen bg-white font-sans text-gray-900">
	<div class="max-w-4xl mx-auto px-6 py-12 lg:py-20">
		<h1 class="text-4xl font-extrabold tracking-tight text-gray-900 mb-6">Documentation</h1>
		<p class="text-lg text-gray-600 mb-12">
			Welcome to the FortiHub documentation. Here you'll find everything you need to integrate
			secure authentication into your applications.
		</p>

		<div class="grid gap-6 md:grid-cols-2">
			<a
				href="/docs/getting-started"
				class="block p-6 rounded-2xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
			>
				<h2 class="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
					Getting Started
					<ArrowRight
						size={16}
						class="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
					/>
				</h2>
				<p class="text-gray-600">Learn how to set up FortiHub in your project.</p>
			</a>
			<!-- Add more sections here -->
		</div>
	</div>
</div>
