import '@testing-library/jest-dom/vitest'

// jsdom에는 화면 스크롤이 없습니다. 실제 위치 검증은 Playwright에서 합니다.
Element.prototype.scrollIntoView = vi.fn()
