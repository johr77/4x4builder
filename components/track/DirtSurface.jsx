import { COLORS } from './TrackConstants'

function nrand(seed) {
	const x = Math.sin(seed * 12.9898) * 43758.5453
	return x - Math.floor(x)
}

export default function DirtSurface({ width, length, seed = 1, corner = false }) {
	const puddles = [0, 1, 2].map((i) => {
		const px = (nrand(seed + i * 3.1) - 0.5) * width * 0.55
		const pz = (nrand(seed + i * 7.7) - 0.5) * length * 0.55
		const sx = 0.7 + nrand(seed + i * 2.2) * 1.1
		const sz = 0.5 + nrand(seed + i * 4.4) * 0.9
		return { px, pz, sx, sz, key: i }
	})

	return (
		<group>
			{/* Base mud */}
			<mesh position={[0, 0.22, 0]} receiveShadow>
				<boxGeometry args={[width, 0.44, length]} />
				<meshStandardMaterial color={COLORS.road} roughness={0.95} />
			</mesh>
			{/* Darker patches */}
			<mesh position={[width * 0.12, 0.441, -length * 0.08]} receiveShadow>
				<boxGeometry args={[width * 0.35, 0.01, length * 0.3]} />
				<meshStandardMaterial color={COLORS.roadDark} roughness={1} />
			</mesh>

			{/* Tire ruts along drive direction */}
			<mesh position={[-1.15, 0.445, 0]} receiveShadow>
				<boxGeometry args={[0.42, 0.03, length * 0.92]} />
				<meshStandardMaterial color={COLORS.rut} roughness={1} />
			</mesh>
			<mesh position={[1.15, 0.445, 0]} receiveShadow>
				<boxGeometry args={[0.42, 0.03, length * 0.92]} />
				<meshStandardMaterial color={COLORS.rut} roughness={1} />
			</mesh>

			{corner && (
				<>
					<mesh position={[0, 0.445, -1.15]} receiveShadow>
						<boxGeometry args={[width * 0.92, 0.03, 0.42]} />
						<meshStandardMaterial color={COLORS.rut} roughness={1} />
					</mesh>
					<mesh position={[0, 0.445, 1.15]} receiveShadow>
						<boxGeometry args={[width * 0.92, 0.03, 0.42]} />
						<meshStandardMaterial color={COLORS.rut} roughness={1} />
					</mesh>
				</>
			)}

			{/* Small puddles */}
			{puddles.map((p) => (
				<group key={p.key} position={[p.px, 0.452, p.pz]}>
					<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
						<circleGeometry args={[p.sx * 0.55, 12]} />
						<meshStandardMaterial color={COLORS.puddleRim} roughness={0.8} />
					</mesh>
					<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
						<circleGeometry args={[p.sx * 0.4, 12]} />
						<meshStandardMaterial
							color={COLORS.puddle}
							roughness={0.12}
							metalness={0.35}
							transparent
							opacity={0.85}
						/>
					</mesh>
				</group>
			))}
		</group>
	)
}