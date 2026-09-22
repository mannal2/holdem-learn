import type { CourseCatalog } from '../types/course'
import { part0, part0Lessons } from './part0'
import { part1, part1Lessons } from './part1'

export const courseCatalog: CourseCatalog = { parts: [part0, part1].sort((a, b) => a.order - b.order), lessons: { ...part0Lessons, ...part1Lessons } }
export function getPart(partId: string) { return courseCatalog.parts.find((part) => part.id === partId) }
export function getLesson(lessonId: string) { return courseCatalog.lessons[lessonId] }
export function getPartForLesson(lessonId: string) { return courseCatalog.parts.find((part) => part.lessonIds.includes(lessonId)) }
export function getNextPartId(catalog: CourseCatalog, partId: string) { const index = catalog.parts.findIndex((part) => part.id === partId); return index < 0 ? undefined : catalog.parts[index + 1]?.id }
