import { createMemoryStorage, progressFixture } from '../../test/progressFixtures'
import { createEmptyProgress } from './createEmptyProgress'
import { LocalProgressRepository } from './LocalProgressRepository'

it('저장한 진도를 다시 불러온다', async () => {
  const repository = new LocalProgressRepository(createMemoryStorage())
  await repository.save(progressFixture)
  await expect(repository.load()).resolves.toEqual({ progress: progressFixture, recovered: false })
})
it('저장값이 없으면 새 진도를 반환한다', async () => {
  await expect(new LocalProgressRepository(createMemoryStorage()).load()).resolves.toEqual({ progress: createEmptyProgress(), recovered: false })
})
it('손상된 JSON은 초기화하고 복구 상태를 알린다', async () => {
  const storage = createMemoryStorage(); storage.setItem('holdem-learning-progress', '{broken')
  await expect(new LocalProgressRepository(storage).load()).resolves.toEqual({ progress: createEmptyProgress(), recovered: true })
})
it('지원하지 않는 진도 버전은 새 진도로 복구한다', async () => {
  const storage = createMemoryStorage(); storage.setItem('holdem-learning-progress', JSON.stringify({ version: 99 }))
  expect((await new LocalProgressRepository(storage).load()).recovered).toBe(true)
})
