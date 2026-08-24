import { SIZE } from './TrackConstants'

export default function InnerWall({ length = SIZE }) {
	const posts = []
	const n = Math.max(1, Math.round(length / 2.2))
	for (let i = 0; i <= n; i++) posts.push(-length / 2 + (i * length) / n)

	return (
		<group>
			{/* dirt berm on track side */}
			<mesh position={[0.22, 0.18, 0]} rotation={[0, 0, -0.45]} receiveShadow>
				<boxGeometry args={[0.7, 0.35, length]} />
				<meshStandardMaterial color='#5c4324' roughness={0.95} />
			</mesh>
			{/* blue jersey barrier */}
			<mesh position={[0, 0.55, 0]} castShadow receiveShadow>
				<boxGeometry args={[0.38, 1.1, length]} />
				<meshStandardMaterial color='#1d4ed8' roughness={0.45} />
			</mesh>
			<mesh position={[0, 0.18, 0]}>
				<boxGeometry args={[0.42, 0.36, length]} />
				<meshStandardMaterial color='#1e3a8a' roughness={0.5} />
			</mesh>
			{/* white posts behind (infield) */}
			{posts.map((z, i) => (
				<mesh key={i} position={[-0.32, 1.05, z]} castShadow>
					<boxGeometry args={[0.1, 2.1, 0.1]} />
					<meshStandardMaterial color='#f3f4f6' roughness={0.4} />
				</mesh>
			))}
		</group>
	)
}