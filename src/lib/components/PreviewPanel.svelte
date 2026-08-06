<script lang="ts">
	interface Section {
		title: string;
		stepIndex: number;
		rows: { label: string; value: string }[];
	}

	interface Props {
		sections: Section[];
		onEditStep?: (stepIndex: number) => void;
	}

	let { sections, onEditStep }: Props = $props();
</script>

<div class="space-y-4">
	{#each sections as section (section.title)}
		<section class="surface step-panel p-5">
			<div class="mb-3 flex items-center justify-between gap-3">
				<h3 class="font-(family-name:--font-display) text-xl text-(--ink)">
					{section.title}
				</h3>
				<button
					type="button"
					class="btn btn-ghost px-3! py-1.5! text-xs"
					onclick={() => onEditStep?.(section.stepIndex)}
				>
					修改此步
				</button>
			</div>
			<dl class="divide-y divide-[rgba(11,46,47,0.08)]">
				{#each section.rows as row (row.label)}
					<div class="flex gap-3 py-2.5 text-sm">
						<dt class="w-28 shrink-0 text-[rgba(11,46,47,0.5)]">{row.label}</dt>
						<dd class="font-medium text-(--ink)">{row.value || '—'}</dd>
					</div>
				{/each}
			</dl>
		</section>
	{/each}
</div>
