import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { SIZE, OUTER_HEIGHT, WALL, COLORS } from './TrackConstants'
import MudRoad from './MudRoad'

export default function Corner({ position = [0, 0, 0], rotation = 0 }) {
	const half = SIZE / 2
	const road = SIZE - WALL
	const ox = -WALL / 2
	const oz = -WALL / 2
	const roadOrigin = [
		position[0] + ox * Math.cos(rotation) + oz * Math.sin(rotation),
		0,
		position[2] - ox * Math.sin(rotation) + oz * Math.cos(rotation),
	]

	return (
		<group position={position} rotation={[0, rotation, 0]}>
			<group position={[ox, 0, oz]}>
				<MudRoad width={road} length={road} origin={roadOrigin} yaw={rotation} corner />
			</group>

			<RigidBody type='fixed' colliders={false}>
				<CuboidCollider args={[WALL / 2, OUTER_HEIGHT / 2, half]} position={[half - WALL / 2, OUTER_HEIGHT / 2, 0]} />
				<CuboidCollider args={[half, OUTER_HEIGHT / 2, WALL / 2]} position={[0, OUTER_HEIGHT / 2, half - WALL / 2]} />
			</RigidBody>

			<mesh position={[half - WALL / 2, OUTER_HEIGHT / 2, 0]} castShadow receiveShadow>
				<boxGeometry args={[WALL, OUTER_HEIGHT, SIZE]} />
				<meshStandardMaterial color={COLORS.outer} />
			</mesh>
			<mesh position={[0, OUTER_HEIGHT / 2, half - WALL / 2]} castShadow receiveShadow>
				<boxGeometry args={[SIZE, OUTER_HEIGHT, WALL]} />
				<meshStandardMaterial color={COLORS.outer} />
			</mesh>
			<mesh position={[half - WALL - 0.02, OUTER_HEIGHT / 2, -WALL / 2]}>
				<boxGeometry args={[0.04, OUTER_HEIGHT - 0.4, SIZE - WALL]} />
				<meshStandardMaterial color={COLORS.inner} />
			</mesh>
			<mesh position={[-WALL / 2, OUTER_HEIGHT / 2, half - WALL - 0.02]}>
				<boxGeometry args={[SIZE - WALL, OUTER_HEIGHT - 0.4, 0.04]} />
				<meshStandardMaterial color={COLORS.inner} />
			</mesh>
		</group>
	)
}