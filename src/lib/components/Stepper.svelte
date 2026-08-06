<script lang="ts">
	interface Props {
		steps: string[];
		current: number;
	}

	let { steps, current }: Props = $props();
</script>

<ol class="stepper mb-7 grid gap-2 sm:grid-cols-3">
	{#each steps as label, i (label)}
		<li
			class="surface relative flex items-center gap-3 overflow-hidden px-3.5 py-3 transition duration-200"
			class:ring-2={i === current}
			class:ring-[rgba(15,118,110,0.35)]={i === current}
			style={i === current
				? 'transform: translateY(-1px); box-shadow: 0 14px 28px rgba(15,118,110,0.12);'
				: i < current
					? 'background: rgba(15,118,110,0.04);'
					: ''}
		>
			{#if i === current}
				<span
					class="absolute inset-x-0 top-0 h-[3px] bg-linear-to-r from-(--accent) to-[#59a9a1]"
					aria-hidden="true"
				></span>
			{/if}
			<span
				class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
				style={i === current
					? 'background: linear-gradient(135deg, var(--accent), var(--accent-deep)); color: white; box-shadow: 0 6px 14px rgba(15,118,110,0.28);'
					: i < current
						? 'background: rgba(15,118,110,0.14); color: var(--accent-deep);'
						: 'background: rgba(11,46,47,0.06); color: rgba(11,46,47,0.45);'}
			>
				{#if i < current}
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
						<path
							d="M3 7.2 5.8 10 11 4"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				{:else}
					{i + 1}
				{/if}
			</span>
			<div class="min-w-0">
				<p
					class="text-[0.68rem] font-semibold tracking-[0.12em] uppercase"
					style={i === current
						? 'color: var(--accent-deep)'
						: 'color: rgba(11,46,47,0.4)'}
				>
					Step {i + 1}
				</p>
				<span
					class="block truncate text-sm font-semibold"
					style={i === current ? 'color: var(--ink)' : 'color: rgba(11,46,47,0.55)'}
				>
					{label}
				</span>
			</div>
		</li>
	{/each}
</ol>
