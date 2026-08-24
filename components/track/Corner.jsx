import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { SIZE, OUTER_HEIGHT, WALL, COLORS } from './TrackConstants'

export default function Corner({ position = [0, 0, 0], rotation = 0 }) {
	const half = SIZE / 2
	const inner = SIZE - WALL * 2

	return (
		<group position={position} rotation={[0, rotation, 0]}>
			<RigidBody type='fixed' colliders={false}>
				<CuboidCollider args={[inner / 2, 0.2, inner / 2]} position={[0, 0.2, 0]} />
				{/* +X wall */}
				<CuboidCollider args={[WALL / 2, OUTER_HEIGHT / 2, half]} position={[half - WALL / 2, OUTER_HEIGHT / 2, 0]} />
				{/* +Z wall */}
				<CuboidCollider args={[half, OUTER_HEIGHT / 2, WALL / 2]} position={[0, OUTER_HEIGHT / 2, half - WALL / 2]} />
				<CuboidCollider args={[half, 0.2, half]} position={[0, OUTER_HEIGHT, 0]} />
			</RigidBody>

			<mesh position={[0, 0.22, 0]} receiveShadow>
				<boxGeometry args={[inner, 0.44, inner]} />
				<meshStandardMaterial color={COLORS.road} />
			</mesh>
			<mesh position={[0, 0.45, 0]} receiveShadow>
				<boxGeometry args={[1.2, 0.02, 1.2]} />
				<meshStandardMaterial color={COLORS.roadDark} />
			</mesh>

			<mesh position={[half - WALL / 2, OUTER_HEIGHT / 2, 0]} castShadow receiveShadow>
				<boxGeometry args={[WALL, OUTER_HEIGHT, SIZE]} />
				<meshStandardMaterial color={COLORS.outer} />
			</mesh>
			<mesh position={[0, OUTER_HEIGHT / 2, half - WALL / 2]} castShadow receiveShadow>
				<boxGeometry args={[SIZE, OUTER_HEIGHT, WALL]} />
				<meshStandardMaterial color={COLORS.outer} />
			</mesh>

			<mesh position={[half - WALL - 0.02, OUTER_HEIGHT / 2, 0]}>
				<boxGeometry args={[0.04, OUTER_HEIGHT - 0.4, SIZE - 0.2]} />
				<meshStandardMaterial color={COLORS.inner} />
			</mesh>
			<mesh position={[0, OUTER_HEIGHT / 2, half - WALL - 0.02]}>
				<boxGeometry args={[SIZE - 0.2, OUTER_HEIGHT - 0.4, 0.04]} />
				<meshStandardMaterial color={COLORS.inner} />
			</mesh>

			<mesh position={[0, OUTER_HEIGHT, 0]} castShadow receiveShadow>
				<boxGeometry args={[SIZE, 0.4, SIZE]} />
				<meshStandardMaterial color={COLORS.outer} />
			</mesh>
		</group>
	)
}