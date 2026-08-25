import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { SIZE, LAYER_HEIGHT, WALL, START_PEAK } from './TrackConstants'
import MudRoad from './MudRoad'
import InnerWall from './InnerWall'
import OuterWall from './OuterWall'

export default function Start({ position = [0, 0, 0], rotation = 0, innerSign = 1 }) {
	const half = SIZE / 2
	const inner = SIZE - WALL * 2
	const innerX = innerSign * (half - 0.28)
	const outerX = -innerX

	return (
		<group position={position} rotation={[0, rotation, 0]}>
			<group position={[0, START_PEAK, 0]}>
				<MudRoad width={inner} length={SIZE} origin={position} yaw={rotation} />
			</group>

			<RigidBody type='fixed' colliders={false}>
				<CuboidCollider args={[0.2, 0.55, half - 0.1]} position={[innerX, START_PEAK + 0.55, 0]} />
				<CuboidCollider args={[0.2, LAYER_HEIGHT / 2, half - 0.05]} position={[outerX, LAYER_HEIGHT / 2, 0]} />
			</RigidBody>

			<group position={[innerX, START_PEAK, 0]} rotation={[0, innerSign === 1 ? Math.PI : 0, 0]}>
				<InnerWall length={SIZE - 0.2} />
			</group>
			<group position={[outerX, 0, 0]} rotation={[0, outerX > 0 ? 0 : Math.PI, 0]}>
				<OuterWall length={SIZE - 0.15} />
			</group>
		</group>
	)
}