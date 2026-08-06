<script lang="ts">
	/**
	 * 报名须知：链接打开遮罩，倒计时结束后才可关闭；关闭后视为已同意。
	 */
	import { onDestroy } from 'svelte';

	interface Props {
		notice: string;
		agreed?: boolean;
		error?: string;
		/** 倒计时秒数，默认 10 */
		countdownSeconds?: number;
	}

	let {
		notice,
		agreed = $bindable(false),
		error = '',
		countdownSeconds = 10
	}: Props = $props();

	let open = $state(false);
	let secondsLeft = $state(0);
	let timer: ReturnType<typeof setInterval> | undefined;

	function clearTimer() {
		if (timer !== undefined) {
			clearInterval(timer);
			timer = undefined;
		}
	}

	function openModal() {
		open = true;
		secondsLeft = countdownSeconds;
		clearTimer();
		timer = setInterval(() => {
			if (secondsLeft <= 1) {
				secondsLeft = 0;
				clearTimer();
			} else {
				secondsLeft -= 1;
			}
		}, 1000);
	}

	function closeModal() {
		if (secondsLeft > 0) return;
		open = false;
		agreed = true;
		clearTimer();
	}

	onDestroy(clearTimer);
</script>

<div class="mb-4">
	<p class="text-sm text-(--ink-soft)">
		请阅读
		<button
			type="button"
			class="mx-0.5 font-semibold text-(--accent-deep) underline decoration-(--accent)/40 underline-offset-4 transition hover:text-(--accent) hover:decoration-(--accent)"
			onclick={openModal}
		>
			报名须知
		</button>
		{#if agreed}
			<span class="ml-1 text-(--accent-deep)">（已阅读）</span>
		{:else}
			<span class="ml-1 text-[rgba(11,46,47,0.45)]">（未阅读）</span>
		{/if}
	</p>
	{#if error}
		<span class="mt-1.5 block text-xs text-(--danger)">{error}</span>
	{/if}
</div>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="notice-title">
		<!-- 倒计时期间禁止点遮罩关闭 -->
		<button
			type="button"
			class="backdrop-enter absolute inset-0 bg-[rgba(11,46,47,0.45)] backdrop-blur-[3px]"
			style="animation: soft-fade 220ms ease;"
			aria-label="关闭遮罩"
			disabled={secondsLeft > 0}
			onclick={closeModal}
		></button>
		<div
			class="modal-enter relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-(--line) bg-white p-5 shadow-(--shadow) md:p-6"
			style="animation: modal-rise 280ms cubic-bezier(0.22, 1, 0.36, 1);"
		>
			<span
				class="absolute inset-x-0 top-0 h-[3px] bg-linear-to-r from-(--accent) via-[#59a9a1] to-transparent"
				aria-hidden="true"
			></span>
			<h2 id="notice-title" class="font-(--font-display) text-2xl text-(--ink)">报名须知</h2>
			<div class="mt-4 max-h-[50vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-(--ink-soft)">
				{notice}
			</div>
			<div class="mt-6 flex justify-end">
				<button
					type="button"
					class="btn btn-primary"
					disabled={secondsLeft > 0}
					onclick={closeModal}
				>
					{#if secondsLeft > 0}
						请阅读（{secondsLeft}s）
					{:else}
						我已阅读，关闭
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}
