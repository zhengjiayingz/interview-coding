<script lang="ts">
	interface Props {
		id: string;
		label: string;
		value?: string;
		required?: boolean;
		error?: string;
		options: { label: string; value: string }[];
		onchange?: (value: string) => void;
	}

	let {
		id,
		label,
		value = $bindable(''),
		required = false,
		error = '',
		options,
		onchange
	}: Props = $props();
</script>

<label class="mb-4 block" for={id}>
	<span class="field-label">
		{label}{#if required}<span class="text-[var(--danger)]"> *</span>{/if}
	</span>
	<select
		{id}
		class="field-control"
		bind:value
		onchange={() => onchange?.(value)}
	>
		<option value="">请选择</option>
		{#each options as opt (opt.value)}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
	{#if error}
		<span class="mt-1.5 block text-xs text-[var(--danger)]">{error}</span>
	{/if}
</label>
