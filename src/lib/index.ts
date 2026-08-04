export type * from './types/enrollment';
export { canEdit, getEditableUntil } from './domain/editWindow';
export { remainingSeats, assertCanBook } from './domain/capacity';
export { validatePersonal, validateDetails } from './domain/validate';
export { mockCourses, getCourseById } from './mock/courses';
export { mockStats } from './mock/stats';
export { applications } from './stores/applications';
