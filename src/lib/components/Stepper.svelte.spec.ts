import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import Stepper from './Stepper.svelte';

afterEach(cleanup);

describe('Stepper', () => {
	it('renders all step labels', () => {
		render(Stepper, {
			props: {
				steps: ['个人信息', '培训详情', '预览确认'],
				current: 1
			}
		});

		expect(screen.getByText('个人信息')).toBeInTheDocument();
		expect(screen.getByText('培训详情')).toBeInTheDocument();
		expect(screen.getByText('预览确认')).toBeInTheDocument();
	});

	it('highlights the current step label', () => {
		render(Stepper, {
			props: {
				steps: ['A', 'B', 'C'],
				current: 2
			}
		});

		const current = screen.getByText('C').closest('li');
		expect(current?.className).toContain('ring-2');
	});
});
