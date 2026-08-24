import Straight from './Straight'
import Corner from './Corner'
import { SIZE, PARTS_ACROSS } from './TrackConstants'

const pos = (i) => -((PARTS_ACROSS * SIZE) / 2) + SIZE / 2 + i * SIZE
const last = PARTS_ACROSS - 1

export default function TrackLoop() {
	const straights = []

	for (let i = 1; i < last; i++) {
				straights.push(<Straight key={`s-${i}`} position={[pos(i), 0, pos(0)]} rotation={Math.PI / 2} innerSign={-1} />)
		straights.push(<Straight key={`n-${i}`} position={[pos(i), 0, pos(last)]} rotation={Math.PI / 2} innerSign={1} />)
		straights.push(<Straight key={`w-${i}`} position={[pos(0), 0, pos(i)]} innerSign={1} />)
		straights.push(<Straight key={`e-${i}`} position={[pos(last), 0, pos(i)]} innerSign={-1} />)
	}

	return (
		<>
			{straights}
			<Corner position={[pos(last), 0, pos(last)]} rotation={0} />
			<Corner position={[pos(last), 0, pos(0)]} rotation={Math.PI / 2} />
			<Corner position={[pos(0), 0, pos(0)]} rotation={Math.PI} />
			<Corner position={[pos(0), 0, pos(last)]} rotation={-Math.PI / 2} />
		</>
	)
}