import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { SIZE, LAYER_HEIGHT, WALL, START_PEAK } from './TrackConstants'
import InnerWall from './InnerWall'
import OuterWall from './OuterWall'

export default function Start({ position = [0, 0, 0], rotation = 0, innerSign = 1 }) {
	const half = SIZE / 2
	const inner = SIZE - WALL * 2
	const innerX = innerSign * (half - 0.28)
	const outerX = -innerX

	return (
		<group position={position} rotation={[0, rotation, 0]}>
			{/* dirt fill so it isn’t floating */}
			<mesh position={[0, START_PEAK / 2, 0]} receiveShadow>
				<boxGeometry args={[inner, START_PEAK, SIZE]} />
				<meshStandardMaterial color='#5a3d22' roughness={0.95} />
			</mesh>
			<mesh position={[0, START_PEAK + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
				<planeGeometry args={[inner, SIZE]} />
				<meshStandardMaterial color='#6b4a28' roughness={0.95} />
			</mesh>

			{/* start line */}
			<group position={[0, START_PEAK + 0.04, 0]}>
				{[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((i) => (
					<mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[i * 0.62, 0, 0]}>
						<planeGeometry args={[0.5, 1.4]} />
						<meshStandardMaterial color={i % 2 === 0 ? '#f8fafc' : '#111111'} />
					</mesh>
				))}
			</group>

			<RigidBody type='fixed' colliders={false}>
				<CuboidCollider args={[inner / 2, 0.2, half]} position={[0, START_PEAK, 0]} />
				<CuboidCollider args={[0.2, 0.55, half]} position={[innerX, START_PEAK + 0.55, 0]} />
				<CuboidCollider args={[0.2, LAYER_HEIGHT / 2, half]} position={[outerX, START_PEAK + LAYER_HEIGHT / 2, 0]} />
			</RigidBody>

			<group position={[innerX, START_PEAK, 0]} rotation={[0, innerSign === 1 ? Math.PI : 0, 0]}>
				<InnerWall />
			</group>
			<group position={[outerX, START_PEAK, 0]} rotation={[0, outerX > 0 ? 0 : Math.PI, 0]}>
				<OuterWall />
			</group>
		</group>
	)
}