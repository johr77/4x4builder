import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { SIZE, LAYER_HEIGHT, WALL, START_PEAK } from './TrackConstants'
import MudRoad from './MudRoad'
import OuterWall from './OuterWall'

export default function Hill({ position = [0, 0, 0], rotation = 0, innerSign = 1, from = 0, to = START_PEAK }) {
	const half = SIZE / 2
	const inner = SIZE - WALL * 2
	const innerX = innerSign * (half - 0.28)
	const outerX = -innerX
	const rise = to - from
	const wallAngle = Math.atan2(rise, SIZE)
	const wallLen = Math.hypot(SIZE, rise)
	const wallY = (from + to) / 2 + 0.55

	return (
		<group position={position} rotation={[0, rotation, 0]}>
			<MudRoad width={inner} length={SIZE} origin={position} yaw={rotation} slopeFrom={from} slopeTo={to} />

			<RigidBody type='fixed' colliders={false}>
				<CuboidCollider
					args={[0.2, 0.55, wallLen / 2]}
					position={[innerX, wallY, 0]}
					rotation={[-wallAngle, 0, 0]}
				/>
				<CuboidCollider args={[0.2, LAYER_HEIGHT / 2, half - 0.05]} position={[outerX, LAYER_HEIGHT / 2, 0]} />
			</RigidBody>

			<mesh position={[innerX, wallY, 0]} rotation={[-wallAngle, 0, 0]} castShadow>
				<boxGeometry args={[0.38, 1.1, wallLen]} />
				<meshStandardMaterial color='#1d4ed8' />
			</mesh>

			<group position={[outerX, 0, 0]} rotation={[0, outerX > 0 ? 0 : Math.PI, 0]}>
				<OuterWall length={SIZE - 0.15} />
			</group>
		</group>
	)
}