<script lang="ts">
	import CourseCard from '$lib/components/CourseCard.svelte';
	import { mockCourses } from '$lib/mock/courses';
</script>

<section class="mb-8 md:mb-10">
	<p class="mb-2 text-xs font-semibold tracking-[0.18em] text-(--accent-deep) uppercase">
		Course Catalog
	</p>
	<h1 class="page-title">选择一门课程，开始报名</h1>
	<p class="page-lead">
		支持线上自学与线下定点培训。线下场次有名额限制，请在开课前一天完成信息确认与修改。
	</p>
</section>

<div class="grid gap-5 md:grid-cols-2">
	{#each mockCourses as course, i (course.id)}
		<div style="animation-delay: {i * 70}ms" class="page-enter">
			<CourseCard {course} />
		</div>
	{/each}
</div>
