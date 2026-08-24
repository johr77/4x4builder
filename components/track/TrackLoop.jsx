import Straight from './Straight'
import Corner from './Corner'
import Start from './Start'
import { SIZE, PARTS_ACROSS } from './TrackConstants'

const pos = (i) => -((PARTS_ACROSS * SIZE) / 2) + SIZE / 2 + i * SIZE

const W = 4
const E = 5
const S = 2
const N = 7

export default function TrackLoop() {
	const tiles = []

	// Two corners side by side — south hairpin
	tiles.push(<Corner key='s-w' position={[pos(W), 0, pos(S)]} rotation={Math.PI} />)
	tiles.push(<Corner key='s-e' position={[pos(E), 0, pos(S)]} rotation={Math.PI / 2} />)

	// Two corners side by side — north hairpin
	tiles.push(<Corner key='n-w' position={[pos(W), 0, pos(N)]} rotation={-Math.PI / 2} />)
	tiles.push(<Corner key='n-e' position={[pos(E), 0, pos(N)]} rotation={0} />)

			tiles.push(
		<Start
			key='start'
			position={[pos(W), 0, (pos(4) + pos(5)) / 2]}
			innerSign={1}
		/>
	)

	for (let j = S + 1; j < N; j++) {
		if (j === 4 || j === 5) continue
		tiles.push(<Straight key={`w-${j}`} position={[pos(W), 0, pos(j)]} innerSign={1} />)
		tiles.push(<Straight key={`e-${j}`} position={[pos(E), 0, pos(j)]} innerSign={-1} />)
	}

	return <>{tiles}</>
}