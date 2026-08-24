import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { RingGeometry, TextureLoader, RepeatWrapping, SRGBColorSpace, Float32BufferAttribute } from 'three'
import { SIZE, LAYER_HEIGHT } from './TrackConstants'

const R = 2.3
const WALL_IN = 0.28
const OUTER_R = SIZE - 0.22
const SEG = 10

export default function Corner({ position = [0, 0, 0], rotation = 0 }) {
	const half = SIZE / 2
	const cx = -half
	const cz = -half
	const filX = cx + WALL_IN + R
	const filZ = cz + WALL_IN + R

	const [sand, sandNormal] = useLoader(TextureLoader, [
		'/assets/images/ground/sand.jpg',
		'/assets/images/ground/sand_normal.jpg',
	])

	useMemo(() => {
		sand.wrapS = sand.wrapT = RepeatWrapping
		sand.repeat.set(1, 1)
		sand.colorSpace = SRGBColorSpace
		sandNormal.wrapS = sandNormal.wrapT = RepeatWrapping
		sandNormal.repeat.set(1, 1)
	}, [sand, sandNormal])

	const geometry = useMemo(() => {
		const geo = new RingGeometry(0.15, OUTER_R, 32, 8, -Math.PI / 2, Math.PI / 2)
		geo.rotateX(-Math.PI / 2)
		const pos = geo.attributes.position
		const uv = geo.attributes.uv
		const colors = []
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i)
			const z = pos.getZ(i)
			const r = Math.hypot(x, z)
			const mid = OUTER_R * 0.55
			const rut =
				Math.exp(-((r - (mid - 1.1)) ** 2) / (2 * 0.38 ** 2)) +
				Math.exp(-((r - (mid + 1.1)) ** 2) / (2 * 0.38 ** 2))
			pos.setY(i, Math.max(0.04 * Math.sin(x * 2 + z) - 0.16 * rut, -0.12))
			uv.setXY(i, x / 6, z / 6)
			const wet = Math.min(1, rut)
			colors.push(0.55 + (1 - wet) * 0.45, 0.42 + (1 - wet) * 0.35, 0.28 + (1 - wet) * 0.2)
		}
		geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
		geo.computeVertexNormals()
		return geo
	}, [])

	const segs = []
	for (let i = 0; i < SEG; i++) segs.push(Math.PI + ((i + 0.5) / SEG) * (Math.PI / 2))
	const posts = []
	for (let i = 0; i <= 4; i++) posts.push(Math.PI + (i / 4) * (Math.PI / 2))
	const chord = 2 * R * Math.sin(Math.PI / 4 / SEG) + 0.08
	const oSegs = []
	for (let i = 0; i < 12; i++) oSegs.push(((i + 0.5) / 12) * (Math.PI / 2))
	const oPosts = []
	for (let i = 0; i <= 12; i++) oPosts.push((i / 12) * (Math.PI / 2))
	const oChord = 2 * OUTER_R * Math.sin(Math.PI / 4 / 12) + 0.08
	const rails = [0.32, 0.62, 0.92, 1.22, 1.52]
	const connectLen = WALL_IN + R

	return (
		<group position={position} rotation={[0, rotation, 0]}>
			<RigidBody type='fixed' colliders='trimesh'>
				<mesh geometry={geometry} position={[cx, 0.32, cz]} receiveShadow>
					<meshStandardMaterial
						map={sand}
						normalMap={sandNormal}
						vertexColors
						color='#5a3d22'
						roughness={0.95}
					/>
				</mesh>
			</RigidBody>

			<RigidBody type='fixed' colliders={false}>
				<CuboidCollider args={[0.2, 0.55, connectLen / 2]} position={[cx + WALL_IN, 0.55, cz + connectLen / 2]} />
				<CuboidCollider args={[connectLen / 2, 0.55, 0.2]} position={[cx + connectLen / 2, 0.55, cz + WALL_IN]} />
				{oSegs.map((t, i) => {
					const ox = cx + OUTER_R * Math.cos(t)
					const oz = cz + OUTER_R * Math.sin(t)
					return <CuboidCollider key={i} args={[0.2, LAYER_HEIGHT / 2, oChord / 2]} position={[ox, LAYER_HEIGHT / 2, oz]} />
				})}
			</RigidBody>

			{/* Inner walls that meet the straights */}
			<mesh position={[cx + WALL_IN, 0.55, cz + connectLen / 2]} castShadow>
				<boxGeometry args={[0.38, 1.1, connectLen]} />
				<meshStandardMaterial color='#1d4ed8' />
			</mesh>
			<mesh position={[cx + connectLen / 2, 0.55, cz + WALL_IN]} castShadow>
				<boxGeometry args={[connectLen, 1.1, 0.38]} />
				<meshStandardMaterial color='#1d4ed8' />
			</mesh>

			{/* Rounded inner */}
			{segs.map((t, i) => {
				const x = filX + R * Math.cos(t)
				const z = filZ + R * Math.sin(t)
				return (
					<mesh key={`ib-${i}`} position={[x, 0.55, z]} rotation={[0, -t + Math.PI / 2, 0]} castShadow>
						<boxGeometry args={[0.38, 1.1, chord]} />
						<meshStandardMaterial color='#1d4ed8' />
					</mesh>
				)
			})}

			{/* One white pole at each straight joint */}
			<mesh position={[cx + WALL_IN, 1.05, cz + 0.12]} castShadow>
				<boxGeometry args={[0.12, 2.1, 0.12]} />
				<meshStandardMaterial color='#f3f4f6' />
			</mesh>
			<mesh position={[cx + 0.12, 1.05, cz + WALL_IN]} castShadow>
				<boxGeometry args={[0.12, 2.1, 0.12]} />
				<meshStandardMaterial color='#f3f4f6' />
			</mesh>
			{posts.map((t, i) => {
				const x = filX + (R - 0.28) * Math.cos(t)
				const z = filZ + (R - 0.28) * Math.sin(t)
				return (
					<mesh key={`ip-${i}`} position={[x, 1.05, z]}>
						<boxGeometry args={[0.1, 2.1, 0.1]} />
						<meshStandardMaterial color='#f3f4f6' />
					</mesh>
				)
			})}

			{/* Outer steel curve */}
			{oPosts.map((t, i) => {
				const x = cx + OUTER_R * Math.cos(t)
				const z = cz + OUTER_R * Math.sin(t)
				return (
					<mesh key={`op-${i}`} position={[x, LAYER_HEIGHT / 2, z]}>
						<boxGeometry args={[0.14, LAYER_HEIGHT, 0.14]} />
						<meshStandardMaterial color='#3f3f46' />
					</mesh>
				)
			})}
			{rails.map((y) =>
				oSegs.map((t, i) => {
					const x = cx + OUTER_R * Math.cos(t)
					const z = cz + OUTER_R * Math.sin(t)
					return (
						<mesh key={`or-${y}-${i}`} position={[x, y, z]} rotation={[0, -t, 0]}>
							<boxGeometry args={[0.12, 0.22, oChord]} />
							<meshStandardMaterial color='#d4d4d8' metalness={0.8} roughness={0.3} />
						</mesh>
					)
				})
			)}
			{oSegs.map((t, i) => {
				const x = cx + OUTER_R * Math.cos(t)
				const z = cz + OUTER_R * Math.sin(t)
				return (
					<mesh key={`of-${i}`} position={[x, 2.25, z]} rotation={[0, -t, 0]}>
						<boxGeometry args={[0.03, 1.4, oChord]} />
						<meshStandardMaterial color='#a1a1aa' transparent opacity={0.35} />
					</mesh>
				)
			})}
		</group>
	)
}