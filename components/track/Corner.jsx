import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { SIZE, LAYER_HEIGHT } from './TrackConstants'
import MudCorner from './MudCorner'

const SEG = 12
const INNER_R = 2.3
const OUTER_R = SIZE - 0.22

function arcPoint(radius, t, cx, cz) {
	return [cx + radius * Math.cos(t), cz + radius * Math.sin(t)]
}

export default function Corner({ position = [0, 0, 0], rotation = 0 }) {
	const half = SIZE / 2
	const cx = -half
	const cz = -half
	const cos = Math.cos(rotation)
	const sin = Math.sin(rotation)
	const worldInner = [position[0] + cx * cos + cz * sin, 0, position[2] - cx * sin + cz * cos]

	const segs = []
	for (let i = 0; i < SEG; i++) segs.push(((i + 0.5) / SEG) * (Math.PI / 2))
	const posts = []
	for (let i = 0; i <= SEG; i++) posts.push((i / SEG) * (Math.PI / 2))
	const chord = (r) => 2 * r * Math.sin(Math.PI / 4 / SEG) + 0.08
	const rails = [0.32, 0.62, 0.92, 1.22, 1.52]

	return (
		<group position={position} rotation={[0, rotation, 0]}>
			<group position={[cx, 0, cz]}>
				<MudCorner innerR={INNER_R} outerR={OUTER_R} origin={worldInner} yaw={rotation} />
			</group>

			{/* White poles: inside apex + both joints to straights */}
			<mesh position={[cx + 0.14, 1.1, cz + 0.14]} castShadow>
				<boxGeometry args={[0.24, 2.2, 0.24]} />
				<meshStandardMaterial color='#f3f4f6' roughness={0.4} />
			</mesh>
			<mesh position={[cx + INNER_R, 1.1, cz + 0.1]} castShadow>
				<boxGeometry args={[0.12, 2.1, 0.12]} />
				<meshStandardMaterial color='#f3f4f6' roughness={0.4} />
			</mesh>
			<mesh position={[cx + 0.1, 1.1, cz + INNER_R]} castShadow>
				<boxGeometry args={[0.12, 2.1, 0.12]} />
				<meshStandardMaterial color='#f3f4f6' roughness={0.4} />
			</mesh>

			<RigidBody type='fixed' colliders={false}>
				{segs.map((t, i) => {
					const [ix, iz] = arcPoint(INNER_R, t, cx, cz)
					const [ox, oz] = arcPoint(OUTER_R, t, cx, cz)
					return (
						<group key={i}>
							<CuboidCollider args={[0.2, 0.55, chord(INNER_R) / 2]} position={[ix, 0.55, iz]} rotation={[0, -t, 0]} />
							<CuboidCollider
								args={[0.2, LAYER_HEIGHT / 2, chord(OUTER_R) / 2]}
								position={[ox, LAYER_HEIGHT / 2, oz]}
								rotation={[0, -t, 0]}
							/>
						</group>
					)
				})}
			</RigidBody>

			{/* Inner blue curve */}
			{segs.map((t, i) => {
				const [x, z] = arcPoint(INNER_R, t, cx, cz)
				return (
					<mesh key={`ib-${i}`} position={[x, 0.55, z]} rotation={[0, -t, 0]} castShadow receiveShadow>
						<boxGeometry args={[0.38, 1.1, chord(INNER_R)]} />
						<meshStandardMaterial color='#1d4ed8' roughness={0.45} />
					</mesh>
				)
			})}
			{posts.map((t, i) => {
				const [x, z] = arcPoint(INNER_R - 0.28, t, cx, cz)
				return (
					<mesh key={`ip-${i}`} position={[x, 1.05, z]} castShadow>
						<boxGeometry args={[0.1, 2.1, 0.1]} />
						<meshStandardMaterial color='#f3f4f6' roughness={0.4} />
					</mesh>
				)
			})}

			{/* Outer steel curve */}
			{posts.map((t, i) => {
				const [x, z] = arcPoint(OUTER_R, t, cx, cz)
				return (
					<mesh key={`op-${i}`} position={[x, LAYER_HEIGHT / 2, z]} castShadow>
						<boxGeometry args={[0.14, LAYER_HEIGHT, 0.14]} />
						<meshStandardMaterial color='#3f3f46' metalness={0.6} roughness={0.4} />
					</mesh>
				)
			})}
			{rails.map((y) =>
				segs.map((t, i) => {
					const [x, z] = arcPoint(OUTER_R, t, cx, cz)
					return (
						<mesh key={`or-${y}-${i}`} position={[x, y, z]} rotation={[0, -t, 0]} castShadow>
							<boxGeometry args={[0.12, 0.22, chord(OUTER_R)]} />
							<meshStandardMaterial color={i % 2 ? '#d4d4d8' : '#c0c0c4'} metalness={0.8} roughness={0.3} />
						</mesh>
					)
				})
			)}
			{segs.map((t, i) => {
				const [x, z] = arcPoint(OUTER_R, t, cx, cz)
				return (
					<mesh key={`of-${i}`} position={[x, 2.25, z]} rotation={[0, -t, 0]}>
						<boxGeometry args={[0.03, 1.4, chord(OUTER_R)]} />
						<meshStandardMaterial color='#a1a1aa' metalness={0.5} roughness={0.5} transparent opacity={0.35} />
					</mesh>
				)
			})}
		</group>
	)
}