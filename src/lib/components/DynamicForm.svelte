<script lang="ts">
	/**
	 * 配置驱动动态表单：按 schema 渲染控件。
	 * 个人信息步、培训详情扩展字段共用；校验规则仍由 domain/配置负责。
	 */
	import type { ExtraFieldSchema } from '$lib/types/enrollment';
	import CheckboxField from './fields/CheckboxField.svelte';
	import SelectField from './fields/SelectField.svelte';
	import TextField from './fields/TextField.svelte';

	interface Props {
		schema: ExtraFieldSchema[];
		/** 字段值袋：个人信息对象或课程 extra 均可 */
		values?: Record<string, any>;
		errors?: Record<string, string>;
		/** HTML id 前缀，避免同一页多表单 id 冲突（如 edit-） */
		idPrefix?: string;
		/**
		 * 可选：失焦/选择后即时校验单个字段。
		 * 返回错误文案或 null；传入时会写回 errors。
		 */
		validateField?: (id: string, values: Record<string, any>) => string | null;
	}

	let {
		schema,
		values = $bindable({}),
		errors = $bindable({}),
		idPrefix = '',
		validateField
	}: Props = $props();

	function asString(id: string): string {
		const v = values[id];
		return typeof v === 'string' ? v : v == null ? '' : String(v);
	}

	function asBool(id: string): boolean {
		return Boolean(values[id]);
	}

	function setValue(id: string, value: unknown) {
		values = { ...values, [id]: value };
	}

	function runValidate(id: string) {
		if (!validateField) return;
		const message = validateField(id, values);
		const next = { ...errors };
		if (message) next[id] = message;
		else delete next[id];
		errors = next;
	}
</script>

{#each schema as field (field.id)}
	{#if field.type === 'select'}
		<SelectField
			id="{idPrefix}{field.id}"
			label={field.label}
			required={field.required}
			options={field.options ?? []}
			error={errors[field.id]}
			value={asString(field.id)}
			onchange={(v) => {
				setValue(field.id, v);
				runValidate(field.id);
			}}
		/>
	{:else if field.type === 'checkbox'}
		<CheckboxField
			id="{idPrefix}{field.id}"
			label={field.label}
			error={errors[field.id]}
			checked={asBool(field.id)}
			onchange={(v) => {
				setValue(field.id, v);
				runValidate(field.id);
			}}
		/>
	{:else}
		<TextField
			id="{idPrefix}{field.id}"
			label={field.label}
			required={field.required}
			multiline={field.type === 'textarea'}
			error={errors[field.id]}
			value={asString(field.id)}
			onchange={(v) => setValue(field.id, v)}
			onblur={() => runValidate(field.id)}
		/>
	{/if}
{/each}
