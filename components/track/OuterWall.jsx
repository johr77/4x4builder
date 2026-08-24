import { SIZE, LAYER_HEIGHT } from './TrackConstants'

export default function OuterWall({ length = SIZE }) {
	const posts = []
	const n = Math.max(1, Math.round(length / 2))
	for (let i = 0; i <= n; i++) posts.push(-length / 2 + (i * length) / n)

	const rails = [0.32, 0.62, 0.92, 1.22, 1.52]

	return (
		<group>
			{posts.map((z, i) => (
				<mesh key={i} position={[0.06, LAYER_HEIGHT / 2, z]} castShadow>
					<boxGeometry args={[0.14, LAYER_HEIGHT, 0.14]} />
					<meshStandardMaterial color='#3f3f46' metalness={0.6} roughness={0.4} />
				</mesh>
			))}
			{rails.map((y, i) => (
				<mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
					<boxGeometry args={[0.12, 0.22, length]} />
					<meshStandardMaterial color={i % 2 ? '#d4d4d8' : '#c0c0c4'} metalness={0.8} roughness={0.3} />
				</mesh>
			))}
			{/* catch fence */}
			<mesh position={[0.02, 2.25, 0]}>
				<boxGeometry args={[0.03, 1.4, length]} />
				<meshStandardMaterial color='#a1a1aa' metalness={0.5} roughness={0.5} transparent opacity={0.35} />
			</mesh>
			<mesh position={[0.02, 2.95, 0]}>
				<boxGeometry args={[0.05, 0.06, length]} />
				<meshStandardMaterial color='#3f3f46' metalness={0.7} roughness={0.35} />
			</mesh>
		</group>
	)
}