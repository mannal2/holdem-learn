import type { RuleVisual } from '../../types/course'
import { PlayingCard } from '../../components/cards/PlayingCard'
import { PokerTable } from '../../components/table/PokerTable'
import { PositionDiagram } from '../../components/table/PositionDiagram'
import { RangeIllustration } from './RangeIllustration'
import './rule-illustration.css'

const suitNames = { spades: '스페이드', hearts: '하트', diamonds: '다이아몬드', clubs: '클로버' }
const suitSymbols = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' }

// 학습 데이터가 고른 그림만 표시합니다. 채점·이동·저장 상태는 다루지 않습니다.
export function RuleIllustration({ visual }: { visual: RuleVisual }) {
  if (visual.kind === 'range-scene') return <RangeIllustration visual={visual} />
  if (visual.kind === 'action-lines') return <div className="range-history rule-illustration">{visual.rows.map(row => <div role="group" aria-label={row.label} key={row.label}><h3>{row.label}</h3><ol>{row.actions.map((action, index) => <li key={index}>{action}</li>)}</ol></div>)}</div>
  if (visual.kind === 'position-scenes') return <div className="range-positions">{(visual.holeCards || visual.history) && <RangeIllustration visual={{ kind: 'range-scene', stage: 'preflop', board: [], candidates: [], holeCards: visual.holeCards, history: visual.history }} />}{visual.rows.map(row => <section key={row.label} aria-label={row.label} role="group"><h3>{row.label}</h3><PositionDiagram activeGroup={row.activeGroup} detailed foldedBefore={row.foldedBefore} activeLabel="상대 자리" /></section>)}</div>
  if (visual.kind === 'bet-comparison') return <div className="bet-comparison rule-illustration">{visual.rows.map(row => <section key={row.label} role="group" aria-label={row.label}><h3>{row.label}</h3><div className="bet-comparison__amounts"><span>베팅 전 팟 <strong>{row.pot}칩</strong></span><span>상대 베팅 <strong>{row.bet}칩</strong></span></div>{visual.showRatio && <><div className="bet-comparison__track" aria-hidden="true"><span style={{ width: `${Math.min(100, row.bet / row.pot * 100)}%` }} /></div><p>팟의 {Math.round(row.bet / row.pot * 100)}%</p></>}</section>)}</div>
  if (visual.kind === 'draw-facts') return <div className="draw-facts rule-illustration">{visual.items.map(item => <div className="draw-fact" role="group" aria-label={item.label} key={item.label}><h3>{item.label}</h3><strong>{item.value}</strong>{item.detail && <p>{item.detail}</p>}</div>)}</div>
  // 카드 배치는 그대로 두고 숫자 관계만 표시합니다. 필요한 숫자는 글과 점선으로도 구분합니다.
  if (visual.kind === 'rank-sequences') return <div className="draw-sequences rule-illustration">{visual.rows.map(row => <div className="draw-sequence" role="group" aria-label={row.label} key={row.label}><h3>{row.label}</h3><div className="draw-sequence__ranks">{row.ranks.map((rank, index) => <span className="draw-rank" data-needed={row.needed?.includes(rank) || undefined} aria-label={`${rank}${row.needed?.includes(rank) ? ' · 필요한 숫자' : ''}`} key={index}>{rank}</span>)}</div><p>{row.detail}</p></div>)}</div>
  if (visual.kind === 'draw-chances') return <div className="draw-chances rule-illustration">{visual.rows.map(row => <div className="draw-chance" role="group" aria-label={row.label} key={row.label}><h3>{row.label}</h3><div className="draw-chance__flow"><div className="draw-chance__cards">{row.cards.map(name => <span className="draw-chance__card" key={name}>{name}</span>)}</div>{row.value && <strong>{row.value}</strong>}</div><p>{row.detail}</p></div>)}</div>
  if (visual.kind === 'table') return <div className="rule-illustration"><PokerTable stage={visual.stage} holeCards={visual.holeCards} communityCards={visual.communityCards} highlightedCards={visual.highlightedCards} /></div>
  if (visual.kind === 'ranked-board') return <div className="poker-table rule-illustration"><div className="poker-table__board" role="group" aria-label="공용 카드"><h3 className="poker-table__label">공용 카드 · 플랍 3장</h3><div className="rule-board-groups rule-board-groups--ranked">{visual.cards.map((card, index) => <div className="rule-board-group" key={card.rank + card.suit} role="group" aria-label={visual.labels[index]}><PlayingCard card={card} /><p>{visual.labels[index]}</p></div>)}</div></div></div>
  if (visual.kind === 'starting-hands') return <div className="rule-hand-groups rule-illustration">{visual.groups.map(group => <section className="rule-hand-group" key={group.label} role="group" aria-label={group.label}><h3>{group.label}</h3><div className="rule-hand-group__cards">{group.cards.map(card => <PlayingCard key={card.rank + card.suit} card={card} />)}</div></section>)}</div>
  if (visual.kind === 'position') return <div>
    {visual.conditions && <ul className="rule-conditions" aria-label="이번 상황의 조건">{visual.conditions.map(condition => <li key={condition}>{condition}</li>)}</ul>}
    {visual.notes?.map(note => <p className="rule-caption" role="note" key={note}>{note}</p>)}
    {visual.holeCards && <RuleIllustration visual={{ kind: 'starting-hands', groups: [{ label: '내 카드 · 2장', cards: visual.holeCards }] }} />}
    <PositionDiagram activeGroup={visual.activeGroup} detailed foldedBefore={visual.foldedBefore} />
  </div>
  if (visual.kind === 'cards') {
    if (visual.mode === 'best-five') {
      const selected = visual.highlightedCards ?? []
      const description = `강조한 5장: ${selected.map(card => `${suitNames[card.suit]} ${card.rank}`).join(', ')}`
      return <div className="rule-illustration"><PokerTable stage="river" holeCards={visual.holeCards} communityCards={visual.communityCards} highlightedCards={selected} /><p className="rule-caption" role="note" aria-label={description}>강조한 5장: {selected.map(card => `${card.rank}${suitSymbols[card.suit]}`).join(' · ')}</p></div>
    }
    if (visual.mode === 'hole') return <div className="poker-table rule-illustration"><div className="poker-table__hand" role="group" aria-label="내 개인 카드"><h3 className="poker-table__label">내 카드 · 2장</h3><div className="poker-table__cards">{visual.holeCards.map(card => <PlayingCard key={card.rank + card.suit} card={card} />)}</div></div></div>
    const groups = [{ label: '플랍 · 처음 3장', cards: visual.communityCards.slice(0, 3) }, { label: '턴 · 1장 추가', cards: visual.communityCards.slice(3, 4) }, { label: '리버 · 1장 추가', cards: visual.communityCards.slice(4, 5) }]
    return <div className="poker-table rule-illustration"><div className="poker-table__board" role="group" aria-label="공용 카드"><h3 className="poker-table__label">공용 카드 · 총 5장</h3><div className="rule-board-groups">{groups.map(group => <div className="rule-board-group" key={group.label} role="group" aria-label={group.label}><div className="poker-table__cards">{group.cards.map(card => <PlayingCard key={card.rank + card.suit} card={card} />)}</div><p>{group.label}</p></div>)}</div></div></div>
  }
  if (visual.kind === 'actions') {
    const situations = visual.situation ? [visual.situation] : ['unopened', 'facing-bet'] as const
    return <div className="rule-actions rule-illustration">{situations.map(situation => {
      const unopened = situation === 'unopened'
      const label = unopened ? '먼저 베팅한 사람이 없음' : '상대는 10칩을 걸었고, 나는 아직 칩을 내지 않았어요'
      const actions = unopened ? [['체크', '0', '칩 없이 넘기기'], ['베팅', '10', '먼저 칩 걸기']] : [['콜', '10', '10칩 맞추기'], ['레이즈', '20', '10칩보다 높이기'], ['폴드', '×', '카드 포기하기']]
      return <section className="rule-action-situation" key={situation} role="group" aria-label={label}><h3>{label}</h3><div className="rule-chip-flow"><span className="rule-chip">{unopened ? '0' : '10'}</span><span aria-hidden="true">→</span><span>{unopened ? '아직 걸린 칩 없음' : '내가 맞출 금액: 10칩'}</span></div>{visual.showActions !== false && <div className="rule-action-list">{actions.map(([name, amount, text]) => <div className="rule-action" key={name}>{name === '폴드' ? <span className="rule-fold" aria-hidden="true"><PlayingCard card={{ rank: 'A', suit: 'spades' }} hidden /><PlayingCard card={{ rank: 'K', suit: 'hearts' }} hidden /><span className="rule-fold__cross">×</span></span> : <span className="rule-chip" aria-hidden="true">{amount}</span>}<strong>{name}</strong><span>{text}</span></div>)}</div>}</section>
    })}</div>
  }
  const seats = ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO']
  const seatLabels: Record<string, string> = { BTN: '딜러 버튼', SB: 'SB', BB: 'BB', UTG: '플레이어 4', HJ: '플레이어 5', CO: '플레이어 6' }
  const first = visual.focus === 'preflop' ? 'UTG' : visual.focus === 'postflop' ? 'SB' : undefined
return <div className="rule-illustration"><div className="rule-seats" role="group" aria-label="6인 테이블 자리"><div className="rule-seats__center">6인 테이블<span>화살표 방향으로 행동 ↻</span></div>{seats.map((seat, index) => <div className={`rule-seat rule-seat--${index}${seat === first || (visual.focus === 'late' && seat === 'BTN') ? ' rule-seat--active' : ''}`} key={seat} role="group" aria-label={`${seatLabels[seat]}${seat === first ? ' · 먼저 행동' : ''}`}><strong>{seatLabels[seat]}</strong>{index < 3 && <small>{seat === 'BTN' ? '기준 자리' : seat === 'SB' ? '스몰 블라인드' : '빅 블라인드'}</small>}{(seat === 'SB' || seat === 'BB') && <span className="rule-seat__chips">◉ {seat === 'SB' ? '1칩' : '2칩'}</span>}{seat === first && <span className="rule-seat__badge">먼저 행동</span>}{visual.focus === 'late' && <span className="rule-seat__badge">{seat === 'BTN' ? '앞선 선택을 보고 결정' : '딜러 버튼보다 먼저 행동'}</span>}</div>)}</div><p className="rule-caption">{visual.focus === 'blinds' ? '딜러 버튼 → SB → BB. 예시에서는 SB 1칩·BB 2칩을 먼저 내요.' : visual.focus === 'preflop' ? 'BB 다음 자리부터 시작해요. 딜러 버튼 뒤에도 SB·BB가 남아 있어요.' : visual.focus === 'postflop' ? '모두 남아 있는 예시예요. 폴드한 자리는 건너뛰어요.' : '플랍 이후 예시예요. 딜러 버튼은 다른 사람의 선택을 보고 결정해요.'}</p></div>
}
