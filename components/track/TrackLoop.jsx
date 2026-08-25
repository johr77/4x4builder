import Straight from './Straight'
import Corner from './Corner'
import Start from './Start'
import Hill from './Hill'
import { SIZE, PARTS_ACROSS, START_PEAK } from './TrackConstants'

const pos = (i) => -((PARTS_ACROSS * SIZE) / 2) + SIZE / 2 + i * SIZE

const W = 4
const E = 5
const S = 2
const N = 7

export default function TrackLoop() {
	const tiles = []

	tiles.push(<Corner key='s-w' position={[pos(W), 0, pos(S)]} rotation={Math.PI} />)
	tiles.push(<Corner key='s-e' position={[pos(E), 0, pos(S)]} rotation={Math.PI / 2} />)
	tiles.push(<Corner key='n-w' position={[pos(W), 0, pos(N)]} rotation={-Math.PI / 2} />)
	tiles.push(<Corner key='n-e' position={[pos(E), 0, pos(N)]} rotation={0} />)

	for (let j = S + 1; j < N; j++) {
		if (j === 3) {
			tiles.push(<Hill key='hill-up' position={[pos(W), 0, pos(j)]} innerSign={1} from={0} to={START_PEAK} />)
		} else if (j === 4) {
			tiles.push(<Start key='start' position={[pos(W), 0, pos(j)]} innerSign={1} />)
		} else if (j === 5) {
			tiles.push(<Hill key='hill-down' position={[pos(W), 0, pos(j)]} innerSign={1} from={START_PEAK} to={0} />)
		} else {
			tiles.push(<Straight key={`w-${j}`} position={[pos(W), 0, pos(j)]} innerSign={1} />)
		}
		tiles.push(<Straight key={`e-${j}`} position={[pos(E), 0, pos(j)]} innerSign={-1} />)
	}

	return <>{tiles}</>
}