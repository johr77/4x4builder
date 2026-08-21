import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { SIZE, OUTER_HEIGHT, WALL, COLORS } from './TrackConstants'

export default function Straight({ position = [0, 0, 0], rotation = 0 }) {
	const half = SIZE / 2
	const inner = SIZE - WALL * 2

	return (
		<group position={position} rotation={[0, rotation, 0]}>
			<RigidBody type='fixed' colliders={false}>
				{/* Bottom road */}
				<CuboidCollider args={[inner / 2, 0.2, half]} position={[0, 0.2, 0]} />
				{/* Left wall */}
				<CuboidCollider args={[WALL / 2, OUTER_HEIGHT / 2, half]} position={[-(half - WALL / 2), OUTER_HEIGHT / 2, 0]} />
				{/* Right wall */}
				<CuboidCollider args={[WALL / 2, OUTER_HEIGHT / 2, half]} position={[half - WALL / 2, OUTER_HEIGHT / 2, 0]} />
				{/* Roof — same outer box as every other part */}
				<CuboidCollider args={[half, 0.2, half]} position={[0, OUTER_HEIGHT, 0]} />
			</RigidBody>

			{/* Road surface (level 0) */}
			<mesh position={[0, 0.22, 0]} receiveShadow>
				<boxGeometry args={[inner, 0.44, SIZE]} />
				<meshStandardMaterial color={COLORS.road} />
			</mesh>
			{/* Center dirt strip */}
			<mesh position={[0, 0.45, 0]} receiveShadow>
				<boxGeometry args={[1.2, 0.02, SIZE]} />
				<meshStandardMaterial color={COLORS.roadDark} />
			</mesh>

			{/* Outer side walls — this is the look every part will share */}
			<mesh position={[-(half - WALL / 2), OUTER_HEIGHT / 2, 0]} castShadow receiveShadow>
				<boxGeometry args={[WALL, OUTER_HEIGHT, SIZE]} />
				<meshStandardMaterial color={COLORS.outer} />
			</mesh>
			<mesh position={[half - WALL / 2, OUTER_HEIGHT / 2, 0]} castShadow receiveShadow>
				<boxGeometry args={[WALL, OUTER_HEIGHT, SIZE]} />
				<meshStandardMaterial color={COLORS.outer} />
			</mesh>

			{/* Inner wall faces */}
			<mesh position={[-(half - WALL - 0.02), OUTER_HEIGHT / 2, 0]}>
				<boxGeometry args={[0.04, OUTER_HEIGHT - 0.4, SIZE - 0.2]} />
				<meshStandardMaterial color={COLORS.inner} />
			</mesh>
			<mesh position={[half - WALL - 0.02, OUTER_HEIGHT / 2, 0]}>
				<boxGeometry args={[0.04, OUTER_HEIGHT - 0.4, SIZE - 0.2]} />
				<meshStandardMaterial color={COLORS.inner} />
			</mesh>

			{/* Roof / top of the box */}
			<mesh position={[0, OUTER_HEIGHT, 0]} castShadow receiveShadow>
				<boxGeometry args={[SIZE, 0.4, SIZE]} />
				<meshStandardMaterial color={COLORS.outer} />
			</mesh>
		</group>
	)
}