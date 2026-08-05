import fs from 'node:fs';

const content = `<script lang="ts">
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
		<section class="surface p-5">
			<div class="mb-3 flex items-center justify-between gap-3">
				<h3 class="font-[family-name:var(--font-display)] text-xl text-(--ink)">
					{section.title}
				</h3>
				<button
					type="button"
					class="btn btn-ghost !px-3 !py-1.5 text-xs"
					onclick={() => onEditStep?.(section.stepIndex)}
				>
					${'\u4fee\u6539\u6b64\u6b65'}
				</button>
			</div>
			<dl class="divide-y divide-[rgba(11,46,47,0.08)]">
				{#each sections.rows as row (row.label)}
					<div class="flex gap-3 py-2.5 text-sm">
						<dt class="w-28 shrink-0 text-[rgba(11,46,47,0.5)]">{row.label}</dt>
						<dd class="font-medium text-(--ink)">{row.value || '${'\u2014'}'}</dd>
					</div>
				{/each}
			</dl>
		</section>
	{/each}
</div>
`;

// fix accidental typo sections.rows -> section.rows
const fixed = content.replace('{#each sections.rows', '{#each section.rows');
fs.writeFileSync('src/lib/components/PreviewPanel.svelte', fixed, 'utf8');
console.log('written ok');
