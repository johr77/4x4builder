import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { SIZE, OUTER_HEIGHT, WALL, COLORS } from './TrackConstants'
import DirtSurface from './DirtSurface'

export default function Corner({ position = [0, 0, 0], rotation = 0 }) {
	const half = SIZE / 2
	const road = SIZE - WALL
	const seed = (position[0] || 1) * 5.1 + (position[2] || 1) * 9.4

	return (
		<group position={position} rotation={[0, rotation, 0]}>
			<RigidBody type='fixed' colliders={false}>
				<CuboidCollider args={[road / 2, 0.2, road / 2]} position={[-WALL / 2, 0.2, -WALL / 2]} />
				<CuboidCollider args={[WALL / 2, OUTER_HEIGHT / 2, half]} position={[half - WALL / 2, OUTER_HEIGHT / 2, 0]} />
				<CuboidCollider args={[half, OUTER_HEIGHT / 2, WALL / 2]} position={[0, OUTER_HEIGHT / 2, half - WALL / 2]} />
				<CuboidCollider args={[half, 0.2, half]} position={[0, OUTER_HEIGHT, 0]} />
			</RigidBody>

			<group position={[-WALL / 2, 0, -WALL / 2]}>
				<DirtSurface width={road} length={road} seed={seed} corner />
			</group>

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
			<mesh position={[0, OUTER_HEIGHT, 0]} castShadow receiveShadow>
				<boxGeometry args={[SIZE, 0.4, SIZE]} />
				<meshStandardMaterial color={COLORS.outer} />
			</mesh>
		</group>
	)
}