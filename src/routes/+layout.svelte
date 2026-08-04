<script lang="ts">
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import './layout.css';

	let { children } = $props();

	const nav = [
		{ href: '/courses', label: '课程' },
		{ href: '/applications', label: '我的报名' },
		{ href: '/stats', label: '报表' }
	];

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>研修台 · 学习培训申请</title>
</svelte:head>

<div class="app-shell">
	<header class="topbar">
		<div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5">
			<a href="/courses" class="brand inline-flex items-center">
				<span class="brand-mark" aria-hidden="true">研</span>
				研修台
			</a>
			<nav class="flex items-center gap-5" aria-label="主导航">
				{#each nav as item (item.href)}
					<a
						class="nav-link"
						href={item.href}
						aria-current={isActive(item.href) ? 'page' : undefined}
					>
						{item.label}
					</a>
				{/each}
			</nav>
		</div>
	</header>

	<main class="page-enter relative mx-auto max-w-5xl px-4 py-8 md:py-10">
		{@render children()}
	</main>
</div>
