import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { SIZE, LAYER_HEIGHT, WALL } from './TrackConstants'
import MudRoad from './MudRoad'

const R = 2.4
const WALL_IN = 0.28
const OUTER_R = SIZE - 0.22
const OSEG = 12

export default function Corner({ position = [0, 0, 0], rotation = 0 }) {
	const half = SIZE / 2
	const cx = -half
	const cz = -half
	const inner = SIZE - WALL * 2
	const ix = cx + WALL_IN
	const iz = cz + WALL_IN
	const filX = ix + R
	const filZ = iz + R
	const leg = R + WALL_IN + 0.5

	const oSegs = []
	for (let i = 0; i < OSEG; i++) oSegs.push(((i + 0.5) / OSEG) * (Math.PI / 2))
	const oPosts = []
	for (let i = 0; i <= OSEG; i++) oPosts.push((i / OSEG) * (Math.PI / 2))
	const oChord = 2 * OUTER_R * Math.sin(Math.PI / 4 / OSEG) + 0.08
	const rails = [0.32, 0.62, 0.92, 1.22, 1.52]

	return (
		<group position={position} rotation={[0, rotation, 0]}>
			<MudRoad width={inner} length={SIZE + 0.35} origin={position} yaw={rotation} />
			<group rotation={[0, Math.PI / 2, 0]}>
				<MudRoad width={inner} length={SIZE + 0.35} origin={position} yaw={rotation + Math.PI / 2} />
			</group>

			{/* Short inner legs that meet the straights, then round — does NOT cross the track */}
			<mesh position={[ix, 0.55, cz + leg / 2 - 0.25]} castShadow>
				<boxGeometry args={[0.38, 1.1, leg]} />
				<meshStandardMaterial color='#1d4ed8' />
			</mesh>
			<mesh position={[cx + leg / 2 - 0.25, 0.55, iz]} castShadow>
				<boxGeometry args={[leg, 1.1, 0.38]} />
				<meshStandardMaterial color='#1d4ed8' />
			</mesh>
			<mesh position={[filX, 0.55, filZ]} rotation={[Math.PI / 2, 0, Math.PI]} castShadow>
				<torusGeometry args={[R, 0.2, 10, 18, Math.PI / 2]} />
				<meshStandardMaterial color='#1d4ed8' />
			</mesh>

			{/* White pole at the inside joint */}
			<mesh position={[ix, 1.1, iz]} castShadow>
				<boxGeometry args={[0.18, 2.2, 0.18]} />
				<meshStandardMaterial color='#f3f4f6' />
			</mesh>

			<RigidBody type='fixed' colliders={false}>
				<CuboidCollider args={[0.2, 0.55, leg / 2]} position={[ix, 0.55, cz + leg / 2 - 0.25]} />
				<CuboidCollider args={[leg / 2, 0.55, 0.2]} position={[cx + leg / 2 - 0.25, 0.55, iz]} />
				{oSegs.map((t, i) => (
					<CuboidCollider
						key={i}
						args={[0.2, LAYER_HEIGHT / 2, oChord / 2]}
						position={[cx + OUTER_R * Math.cos(t), LAYER_HEIGHT / 2, cz + OUTER_R * Math.sin(t)]}
					/>
				))}
			</RigidBody>

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