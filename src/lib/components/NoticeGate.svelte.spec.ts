import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NoticeGate from './NoticeGate.svelte';

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

describe('NoticeGate', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	it('opens modal from link and blocks close until countdown ends', async () => {
		render(NoticeGate, {
			props: {
				notice: '请提前到场签到。',
				agreed: false,
				countdownSeconds: 10
			}
		});

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		expect(screen.getByText('（未阅读）')).toBeInTheDocument();
		await fireEvent.click(screen.getByRole('button', { name: '报名须知' }));
		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /请阅读（10s）/ })).toBeDisabled();

		await vi.advanceTimersByTimeAsync(9_000);
		expect(screen.getByRole('button', { name: /请阅读（1s）/ })).toBeDisabled();

		await vi.advanceTimersByTimeAsync(1_000);
		const closeBtn = screen.getByRole('button', { name: '我已阅读，关闭' });
		expect(closeBtn).not.toBeDisabled();
		await fireEvent.click(closeBtn);

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		expect(screen.getByText('（已阅读）')).toBeInTheDocument();
	});
});
