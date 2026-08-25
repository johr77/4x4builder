import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { SIZE, LAYER_HEIGHT, WALL, START_PEAK } from './TrackConstants'
import MudRoad from './MudRoad'
import InnerWall from './InnerWall'
import OuterWall from './OuterWall'

const ROAD_Y = 0.32 + START_PEAK

export default function Start({ position = [0, 0, 0], rotation = 0, innerSign = 1 }) {
	const half = SIZE / 2
	const inner = SIZE - WALL * 2
	const innerX = innerSign * (half - 0.28)
	const outerX = -innerX

	return (
		<group position={position} rotation={[0, rotation, 0]}>
			{/* fill only — shorter so it doesn’t make a cliff into the hill */}


			<group position={[0, START_PEAK, 0]}>
				<MudRoad width={inner} length={SIZE} origin={position} yaw={rotation} />
			</group>

			<group position={[0, ROAD_Y + 0.03, 0]}>
				{[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((i) => (
					<mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[i * 0.62, 0, 0]}>
						<planeGeometry args={[0.5, 1.4]} />
						<meshStandardMaterial color={i % 2 === 0 ? '#f8fafc' : '#111111'} />
					</mesh>
				))}
			</group>

			<RigidBody type='fixed' colliders={false}>
				<CuboidCollider args={[inner / 2, 0.2, half - 0.1]} position={[0, ROAD_Y, 0]} />
				<CuboidCollider args={[0.2, 0.55, half - 0.1]} position={[innerX, ROAD_Y + 0.55, 0]} />
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