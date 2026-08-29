import { START_PEAK } from './TrackConstants'
import Straight from './Straight'

export default function Start({ position = [0, 0, 0], rotation = 0, innerSign = -1 }) {
	return (
		<group position={[0, START_PEAK, 0]}>
			<Straight position={position} rotation={rotation} innerSign={innerSign} />
		</group>
	)
}