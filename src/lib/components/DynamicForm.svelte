<script lang="ts">
	import type { ExtraFieldSchema } from '$lib/types/enrollment';
	import CheckboxField from './fields/CheckboxField.svelte';
	import SelectField from './fields/SelectField.svelte';
	import TextField from './fields/TextField.svelte';

	interface Props {
		schema: ExtraFieldSchema[];
		values?: Record<string, unknown>;
		errors?: Record<string, string>;
	}

	let { schema, values = $bindable({}), errors = {} }: Props = $props();

	function asString(id: string): string {
		const v = values[id];
		return typeof v === 'string' ? v : v == null ? '' : String(v);
	}

	function asBool(id: string): boolean {
		return Boolean(values[id]);
	}
</script>

{#each schema as field (field.id)}
	{#if field.type === 'select'}
		<SelectField
			id={field.id}
			label={field.label}
			required={field.required}
			options={field.options ?? []}
			error={errors[field.id]}
			value={asString(field.id)}
			onchange={(v) => {
				values = { ...values, [field.id]: v };
			}}
		/>
	{:else if field.type === 'checkbox'}
		<CheckboxField
			id={field.id}
			label={field.label}
			error={errors[field.id]}
			checked={asBool(field.id)}
			onchange={(v) => {
				values = { ...values, [field.id]: v };
			}}
		/>
	{:else}
		<TextField
			id={field.id}
			label={field.label}
			required={field.required}
			multiline={field.type === 'textarea'}
			error={errors[field.id]}
			value={asString(field.id)}
			onchange={(v) => {
				values = { ...values, [field.id]: v };
			}}
		/>
	{/if}
{/each}
