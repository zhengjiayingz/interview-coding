<script lang="ts">
	interface Props {
		id: string;
		label: string;
		value?: string;
		required?: boolean;
		error?: string;
		multiline?: boolean;
		onchange?: (value: string) => void;
	}

	let {
		id,
		label,
		value = $bindable(''),
		required = false,
		error = '',
		multiline = false,
		onchange
	}: Props = $props();
</script>

<label class="mb-4 block" for={id}>
	<span class="field-label">
		{label}{#if required}<span class="text-(--danger)"> *</span>{/if}
	</span>
	{#if multiline}
		<textarea
			{id}
			class="field-control min-h-24"
			bind:value
			oninput={() => onchange?.(value)}
		></textarea>
	{:else}
		<input
			{id}
			type="text"
			class="field-control"
			bind:value
			oninput={() => onchange?.(value)}
		/>
	{/if}
	{#if error}
		<span class="mt-1.5 block text-xs text-(--danger)">{error}</span>
	{/if}
</label>
