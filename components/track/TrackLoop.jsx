import Straight from './Straight'
import Corner from './Corner'
import Start from './Start'
import Hill from './Hill'
import { SIZE, PARTS_ACROSS, START_PEAK } from './TrackConstants'

const pos = (i) => -((PARTS_ACROSS * SIZE) / 2) + SIZE / 2 + i * SIZE

// Clockwise cell list [col, row]. Col = west→east, row = south→north.
const PATH = [
	[1, 3],
	[1, 4], // start, facing north
	[1, 5],
	[1, 6],
	[1, 7],
	[1, 8],
	[2, 8],
	[3, 8],
	[4, 8],
	[5, 8],
	[6, 8],
	[7, 8],
	[8, 8],
	[8, 7],
	[8, 6],
	[7, 6],
	[7, 5],
	[7, 4],
	[8, 4],
	[8, 3],
	[8, 2],
	[8, 1],
	[7, 1],
	[6, 1],
	[5, 1],
	[4, 1],
	[3, 1],
	[2, 1],
	[1, 1],
	[1, 2],
]

const SPECIALS = {
	'1,3': { type: 'hill', from: 0, to: START_PEAK },
	'1,4': { type: 'start' },
	'1,5': { type: 'hill', from: START_PEAK, to: 0 },
	// eastbound bump along the north wall
	'3,8': { type: 'hill', from: 0, to: START_PEAK },
	'4,8': { type: 'hill', from: START_PEAK, to: 0 },
	// southbound double bump along the east wall
	'8,3': { type: 'hill', from: START_PEAK, to: 0 },
	'8,2': { type: 'hill', from: 0, to: START_PEAK },
}

function dirBetween(a, b) {
	const dc = b[0] - a[0]
	const dr = b[1] - a[1]
	if (dc === 1) return 'E'
	if (dc === -1) return 'W'
	if (dr === 1) return 'N'
	if (dr === -1) return 'S'
	return null
}

function opp(d) {
	return { N: 'S', S: 'N', E: 'W', W: 'E' }[d]
}

function cornerRot(dIn, dOut) {
	const edges = [opp(dIn), dOut]
	const has = (e) => edges.includes(e)
	if (has('W') && has('S')) return 0
	if (has('W') && has('N')) return Math.PI / 2
	if (has('E') && has('N')) return Math.PI
	if (has('E') && has('S')) return -Math.PI / 2
	return 0
}

function innerSignFor(dOut) {
	if (dOut === 'N' || dOut === 'E') return 1
	return -1
}

export default function TrackLoop() {
	const n = PATH.length
	return PATH.map((curr, i) => {
		const prev = PATH[(i - 1 + n) % n]
		const next = PATH[(i + 1) % n]
		const dIn = dirBetween(prev, curr)
		const dOut = dirBetween(curr, next)
		const [c, r] = curr
		const position = [pos(c), 0, pos(r)]
		const key = `${c},${r}`
		const special = SPECIALS[key]

		if (dIn !== dOut) {
			return <Corner key={key} position={position} rotation={cornerRot(dIn, dOut)} />
		}

		const rotation = dOut === 'N' || dOut === 'S' ? 0 : Math.PI / 2
		const innerSign = innerSignFor(dOut)

		if (special?.type === 'start') {
			return <Start key={key} position={position} rotation={rotation} innerSign={innerSign} />
		}
		if (special?.type === 'hill') {
			return (
				<Hill
					key={key}
					position={position}
					rotation={rotation}
					innerSign={innerSign}
					from={special.from}
					to={special.to}
				/>
			)
		}
		return <Straight key={key} position={position} rotation={rotation} innerSign={innerSign} />
	})
}