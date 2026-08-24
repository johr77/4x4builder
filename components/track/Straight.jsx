import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { SIZE, OUTER_HEIGHT, WALL, COLORS } from './TrackConstants'
import MudRoad from './MudRoad'

export default function Straight({ position = [0, 0, 0], rotation = 0 }) {
	const half = SIZE / 2
	const inner = SIZE - WALL * 2

	return (
		<group position={position} rotation={[0, rotation, 0]}>
			<MudRoad width={inner} length={SIZE} origin={position} yaw={rotation} />

			<RigidBody type='fixed' colliders={false}>
				<CuboidCollider args={[WALL / 2, OUTER_HEIGHT / 2, half]} position={[-(half - WALL / 2), OUTER_HEIGHT / 2, 0]} />
				<CuboidCollider args={[WALL / 2, OUTER_HEIGHT / 2, half]} position={[half - WALL / 2, OUTER_HEIGHT / 2, 0]} />
			</RigidBody>

			<mesh position={[-(half - WALL / 2), OUTER_HEIGHT / 2, 0]} castShadow receiveShadow>
				<boxGeometry args={[WALL, OUTER_HEIGHT, SIZE]} />
				<meshStandardMaterial color={COLORS.outer} />
			</mesh>
			<mesh position={[half - WALL / 2, OUTER_HEIGHT / 2, 0]} castShadow receiveShadow>
				<boxGeometry args={[WALL, OUTER_HEIGHT, SIZE]} />
				<meshStandardMaterial color={COLORS.outer} />
			</mesh>
			<mesh position={[-(half - WALL - 0.02), OUTER_HEIGHT / 2, 0]}>
				<boxGeometry args={[0.04, OUTER_HEIGHT - 0.4, SIZE - 0.2]} />
				<meshStandardMaterial color={COLORS.inner} />
			</mesh>
			<mesh position={[half - WALL - 0.02, OUTER_HEIGHT / 2, 0]}>
				<boxGeometry args={[0.04, OUTER_HEIGHT - 0.4, SIZE - 0.2]} />
				<meshStandardMaterial color={COLORS.inner} />
			</mesh>
		</group>
	)
}