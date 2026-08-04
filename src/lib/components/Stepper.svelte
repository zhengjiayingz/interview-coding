<script lang="ts">
	interface Props {
		steps: string[];
		current: number;
	}

	let { steps, current }: Props = $props();
</script>

<ol class="mb-7 grid gap-2 sm:grid-cols-3">
	{#each steps as label, i (label)}
		<li
			class="surface flex items-center gap-3 px-3.5 py-3 transition duration-200"
			class:ring-2={i === current}
			class:ring-[rgba(15,118,110,0.35)]={i === current}
			style={i === current ? 'transform: translateY(-1px)' : ''}
		>
			<span
				class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
				style={i === current
					? 'background: linear-gradient(135deg, var(--accent), var(--accent-deep)); color: white;'
					: i < current
						? 'background: rgba(15,118,110,0.12); color: var(--accent-deep);'
						: 'background: rgba(11,46,47,0.06); color: rgba(11,46,47,0.45);'}
			>
				{i + 1}
			</span>
			<span
				class="text-sm font-semibold"
				style={i === current ? 'color: var(--ink)' : 'color: rgba(11,46,47,0.55)'}
			>
				{label}
			</span>
		</li>
	{/each}
</ol>
