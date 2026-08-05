import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import DynamicForm from './DynamicForm.svelte';

afterEach(cleanup);

describe('DynamicForm', () => {
	it('renders schema fields and required error text', () => {
		render(DynamicForm, {
			props: {
				schema: [
					{
						id: 'tshirt',
						label: 'T恤尺码',
						type: 'select',
						required: true,
						options: [
							{ label: 'M', value: 'M' },
							{ label: 'L', value: 'L' }
						]
					},
					{
						id: 'dietary',
						label: '饮食禁忌',
						type: 'text'
					}
				],
				values: {},
				errors: {
					tshirt: '请填写T恤尺码'
				}
			}
		});

		expect(screen.getByLabelText(/T恤尺码/)).toBeInTheDocument();
		expect(screen.getByLabelText('饮食禁忌')).toBeInTheDocument();
		expect(screen.getByText('请填写T恤尺码')).toBeInTheDocument();
	});

	it('updates input value when typing', async () => {
		render(DynamicForm, {
			props: {
				schema: [{ id: 'dietary', label: '饮食禁忌', type: 'text' }],
				values: { dietary: '' }
			}
		});

		const input = screen.getByLabelText('饮食禁忌') as HTMLInputElement;
		await fireEvent.input(input, { target: { value: '海鲜' } });
		expect(input.value).toBe('海鲜');
	});
});
