import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { SIZE, LAYER_HEIGHT, WALL } from './TrackConstants'
import MudRoad from './MudRoad'
import InnerWall from './InnerWall'
import OuterWall from './OuterWall'

export default function Straight({ position = [0, 0, 0], rotation = 0, innerSign = -1 }) {
	const half = SIZE / 2
	const inner = SIZE - WALL * 2
	const innerX = innerSign * (half - 0.28)
	const outerX = -innerX

	return (
		<group position={position} rotation={[0, rotation, 0]}>
			<MudRoad width={inner} length={SIZE} origin={position} yaw={rotation} />

			<RigidBody type='fixed' colliders={false}>
				<CuboidCollider args={[0.2, 0.55, half]} position={[innerX, 0.55, 0]} />
				<CuboidCollider args={[0.2, LAYER_HEIGHT / 2, half]} position={[outerX, LAYER_HEIGHT / 2, 0]} />
			</RigidBody>

			<group position={[innerX, 0, 0]} rotation={[0, innerSign === 1 ? Math.PI : 0, 0]}>
				<InnerWall />
			</group>
			<group position={[outerX, 0, 0]} rotation={[0, outerX > 0 ? 0 : Math.PI, 0]}>
				<OuterWall />
			</group>
		</group>
	)
}