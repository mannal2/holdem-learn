export function calculatePercentage(correct: number, answered: number) { return answered === 0 ? 0 : Math.round((correct / answered) * 100) }
export function hasPassed(correct: number, answered: number, passingPercentage: number) { return calculatePercentage(correct, answered) >= passingPercentage }
