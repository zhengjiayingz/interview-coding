/** 课程学习方式：线上 / 线下 / 混合 */
export type CourseMode = 'online' | 'offline' | 'hybrid';

/** 报名单状态 */
export type EnrollmentStatus = 'draft' | 'submitted' | 'cancelled';

/** 扩展表单控件类型（配合 ExtraFieldSchema） */
export type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'checkbox';

/** 课程可配置的扩展字段定义，用于特殊活动在报名详情步动态渲染表单项 */
export interface ExtraFieldSchema {
	id: string;
	label: string;
	type: FieldType;
	required?: boolean;
	options?: { label: string; value: string }[];
}

/** 某一培训地点下的具体开课场次（时间段），可选带本场容量 */
export interface Session {
	id: string;
	startsAt: string;
	endsAt: string;
	/** 若省略，可由地点 capacity 与报名数据推导余量 */
	seatsLeft?: number;
}

/** 线下/混合课的培训地点：含地址、总容量及下属场次 */
export interface Venue {
	id: string;
	name: string;
	address: string;
	capacity: number;
	sessions: Session[];
}

/** 可报名的培训课程（本项目用 mock 展示，不做课程后台 CRUD） */
export interface Course {
	id: string;
	title: string;
	description: string;
	mode: CourseMode;
	startAt: string;
	endAt: string;
	venues: Venue[]; /** 课程可选的培训地点列表 */
	extraFieldSchema: ExtraFieldSchema[]; /** 课程可配置的扩展字段定义，用于特殊活动在报名详情步动态渲染表单项 */
	notice?: string; /** 课程报名须知 */
}

/** 报名人的基本联系信息（向导第 1 步） */
export interface PersonalInfo {
	name: string;
	phone: string;
	email: string;
	address: string;
	employeeId?: string;
}

/** 学员针对某门课的一份报名申请（提交后持久化，受可编辑窗口约束） */
export interface Enrollment {
	id: string;
	courseId: string;
	status: EnrollmentStatus;
	personal: PersonalInfo;
	learningMode: CourseMode;
	venueId?: string;
	sessionId?: string;
	extra: Record<string, unknown>;
	agreedToNotice: boolean;
	createdAt: string;
	updatedAt: string;
}
