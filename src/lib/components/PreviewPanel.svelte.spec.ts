import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PreviewPanel from './PreviewPanel.svelte';

afterEach(cleanup);

describe('PreviewPanel', () => {
	it('renders section rows', () => {
		render(PreviewPanel, {
			props: {
				sections: [
					{
						title: '个人信息',
						stepIndex: 0,
						rows: [
							{ label: '姓名', value: '张三' },
							{ label: '电话', value: '13800000000' }
						]
					}
				]
			}
		});

		expect(screen.getByText('个人信息')).toBeInTheDocument();
		expect(screen.getByText('张三')).toBeInTheDocument();
		expect(screen.getByText('13800000000')).toBeInTheDocument();
	});

	it('calls onEditStep with section stepIndex', async () => {
		const onEditStep = vi.fn();
		render(PreviewPanel, {
			props: {
				sections: [
					{
						title: '培训详情',
						stepIndex: 1,
						rows: [{ label: '地点', value: '广州' }]
					}
				],
				onEditStep
			}
		});

		await fireEvent.click(screen.getByRole('button', { name: '修改此步' }));
		expect(onEditStep).toHaveBeenCalledWith(1);
	});
});
