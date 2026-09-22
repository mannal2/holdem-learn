import type {
  CourseCatalog,
  LessonDefinition,
  PartDefinition,
  SingleChoiceStep,
} from '../types/course'

const sampleQuestion: SingleChoiceStep = {
  id: 'sample-question',
  type: 'single-choice',
  prompt: '상대의 베팅과 같은 금액을 내는 행동은?',
  options: [
    { id: 'call', label: '콜' },
    { id: 'fold', label: '폴드' },
  ],
  correctOptionId: 'call',
  explanation: '콜은 상대의 베팅과 같은 금액을 내는 행동입니다.',
}

const sampleLesson: LessonDefinition = {
  id: 'sample-lesson',
  title: '샘플 Lesson',
  objective: '선택 문제를 이해한다.',
  steps: [sampleQuestion],
}

const samplePart: PartDefinition = {
  id: 'sample-part',
  order: 0,
  title: '샘플 Part',
  description: '검증 테스트용 Part',
  lessonIds: ['sample-lesson'],
}

export const validCatalog: CourseCatalog = {
  parts: [samplePart],
  lessons: { 'sample-lesson': sampleLesson },
}

export const catalogFixture = validCatalog

export function makeCatalog(
  part: PartDefinition,
  lessons: Record<string, LessonDefinition>,
): CourseCatalog {
  return { parts: [part], lessons }
}

export function makeCatalogWithDuplicateLessonId(id: string): CourseCatalog {
  const catalog = structuredClone(validCatalog)
  const first = { ...catalog.lessons['sample-lesson'], id }
  const second = { ...catalog.lessons['sample-lesson'], id }

  catalog.parts[0].lessonIds = ['first-lesson', 'second-lesson']
  catalog.lessons = {
    'first-lesson': first,
    'second-lesson': second,
  }
  return catalog
}

export function makeCatalogWithMissingCorrectOption(): CourseCatalog {
  const catalog = structuredClone(validCatalog)
  const step = catalog.lessons['sample-lesson'].steps[0] as SingleChoiceStep
  step.correctOptionId = 'missing'
  return catalog
}
