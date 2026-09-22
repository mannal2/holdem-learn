import type {
  CourseCatalog,
  MultiChoiceStep,
  SingleChoiceStep,
} from '../types/course'

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  })
  return [...duplicates]
}

function validateChoiceStep(
  step: SingleChoiceStep | MultiChoiceStep,
): string[] {
  const optionIds = new Set(step.options.map((option) => option.id))
  const correctIds =
    step.type === 'single-choice'
      ? [step.correctOptionId]
      : step.correctOptionIds

  return correctIds
    .filter((correctId) => !optionIds.has(correctId))
    .map(
      (correctId) =>
        `Step ${step.id}의 정답 ${correctId}은 선택지에 없습니다.`,
    )
}

export function validateCourse(catalog: CourseCatalog): string[] {
  const errors: string[] = []

  findDuplicates(catalog.parts.map((part) => part.id)).forEach((id) => {
    errors.push(`중복된 Part ID: ${id}`)
  })

  const lessonEntries = Object.entries(catalog.lessons)
  findDuplicates(lessonEntries.map(([, lesson]) => lesson.id)).forEach((id) => {
    errors.push(`중복된 Lesson ID: ${id}`)
  })

  lessonEntries.forEach(([key, lesson]) => {
    if (key !== lesson.id) {
      errors.push(`Lesson 키 ${key}와 내부 ID ${lesson.id}가 다릅니다.`)
    }
    if (lesson.steps.length === 0) {
      errors.push(`Lesson ${lesson.id}에 Step이 없습니다.`)
    }
    if (
      lesson.passingPercentage !== undefined &&
      (lesson.passingPercentage <= 0 || lesson.passingPercentage > 100)
    ) {
      errors.push(`Lesson ${lesson.id}의 통과 기준은 1부터 100 사이여야 합니다.`)
    }

    lesson.steps.forEach((step) => {
      if (step.type === 'single-choice' || step.type === 'multi-choice') {
        errors.push(...validateChoiceStep(step))
      }
    })
  })

  catalog.parts.forEach((part) => {
    part.lessonIds.forEach((lessonId) => {
      if (!catalog.lessons[lessonId]) {
        errors.push(`Part ${part.id}가 없는 Lesson ${lessonId}를 참조합니다.`)
      }
    })
  })

  const stepIds = lessonEntries.flatMap(([, lesson]) =>
    lesson.steps.map((step) => step.id),
  )
  findDuplicates(stepIds).forEach((id) => {
    errors.push(`중복된 Step ID: ${id}`)
  })

  return errors
}
