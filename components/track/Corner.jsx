import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { SIZE, LAYER_HEIGHT, WALL } from './TrackConstants'
import MudRoad from './MudRoad'
import InnerWall from './InnerWall'

const OUTER_R = SIZE - 0.22
const OSEG = 12

export default function Corner({ position = [0, 0, 0], rotation = 0 }) {
	const half = SIZE / 2
	const cx = -half
	const cz = -half
	const inner = SIZE - WALL * 2
	const innerX = -(half - 0.28)
	const innerZ = -(half - 0.28)

	const oSegs = []
	for (let i = 0; i < OSEG; i++) oSegs.push(((i + 0.5) / OSEG) * (Math.PI / 2))
	const oPosts = []
	for (let i = 0; i <= OSEG; i++) oPosts.push((i / OSEG) * (Math.PI / 2))
	const oChord = 2 * OUTER_R * Math.sin(Math.PI / 4 / OSEG) + 0.08
	const rails = [0.32, 0.62, 0.92, 1.22, 1.52]

	return (
		<group position={position} rotation={[0, rotation, 0]}>
			{/* Same mud as the straights, in an L so all 4 corners match */}
			<MudRoad width={inner} length={SIZE + 0.35} origin={position} yaw={rotation} />
			<group rotation={[0, Math.PI / 2, 0]}>
				<MudRoad width={inner} length={SIZE + 0.35} origin={position} yaw={rotation + Math.PI / 2} />
			</group>

			{/* Inner walls — same piece as the straight, so they meet */}
			<group position={[innerX, 0, 0]}>
				<InnerWall />
			</group>
			<group position={[0, 0, innerZ]} rotation={[0, Math.PI / 2, 0]}>
				<InnerWall />
			</group>

			{/* White pole in the inside corner joint */}
			<mesh position={[cx + 0.18, 1.1, cz + 0.18]} castShadow>
				<boxGeometry args={[0.22, 2.2, 0.22]} />
				<meshStandardMaterial color='#f3f4f6' />
			</mesh>

			<RigidBody type='fixed' colliders={false}>
				<CuboidCollider args={[0.2, 0.55, half]} position={[innerX, 0.55, 0]} />
				<CuboidCollider args={[half, 0.55, 0.2]} position={[0, 0.55, innerZ]} />
				{oSegs.map((t, i) => (
					<CuboidCollider
						key={i}
						args={[0.2, LAYER_HEIGHT / 2, oChord / 2]}
						position={[cx + OUTER_R * Math.cos(t), LAYER_HEIGHT / 2, cz + OUTER_R * Math.sin(t)]}
					/>
				))}
			</RigidBody>

			{/* Outer steel curve */}
			{oPosts.map((t, i) => (
				<mesh key={`op-${i}`} position={[cx + OUTER_R * Math.cos(t), LAYER_HEIGHT / 2, cz + OUTER_R * Math.sin(t)]}>
					<boxGeometry args={[0.14, LAYER_HEIGHT, 0.14]} />
					<meshStandardMaterial color='#3f3f46' />
				</mesh>
			))}
			{rails.map((y) =>
				oSegs.map((t, i) => (
					<mesh
						key={`or-${y}-${i}`}
						position={[cx + OUTER_R * Math.cos(t), y, cz + OUTER_R * Math.sin(t)]}
						rotation={[0, -t, 0]}
					>
						<boxGeometry args={[0.12, 0.22, oChord]} />
						<meshStandardMaterial color='#d4d4d8' metalness={0.8} roughness={0.3} />
					</mesh>
				))
			)}
			{oSegs.map((t, i) => (
				<mesh
					key={`of-${i}`}
					position={[cx + OUTER_R * Math.cos(t), 2.25, cz + OUTER_R * Math.sin(t)]}
					rotation={[0, -t, 0]}
				>
					<boxGeometry args={[0.03, 1.4, oChord]} />
					<meshStandardMaterial color='#a1a1aa' transparent opacity={0.35} />
				</mesh>
			))}
		</group>
	)
}