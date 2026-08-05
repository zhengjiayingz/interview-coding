<script lang="ts">
	interface Props {
		id: string;
		label: string;
		checked?: boolean;
		error?: string;
		onchange?: (checked: boolean) => void;
	}

	let { id, label, checked = $bindable(false), error = '', onchange }: Props = $props();
</script>

<label class="mb-4 flex cursor-pointer items-start gap-3 text-sm" for={id}>
	<input
		{id}
		type="checkbox"
		class="mt-1 h-4 w-4 accent-(--accent)"
		bind:checked
		onchange={() => onchange?.(checked)}
	/>
	<span class="leading-relaxed text-(--ink-soft)">{label}</span>
</label>
{#if error}
	<span class="mb-3 block text-xs text-(--danger)">{error}</span>
{/if}
