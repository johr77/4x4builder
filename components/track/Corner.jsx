import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { RingGeometry, TextureLoader, RepeatWrapping, SRGBColorSpace, Float32BufferAttribute } from 'three'
import { SIZE, LAYER_HEIGHT, WALL } from './TrackConstants'
import MudRoad from './MudRoad'

const BERM_W = 3
const BERM_H = 1.0
const OUTER_R = SIZE - 0.22
const INNER_R = 0.5
const OSEG = 12

function useMudTextures() {
	const [sand, sandNormal] = useLoader(TextureLoader, [
		'/assets/images/ground/sand.jpg',
		'/assets/images/ground/sand_normal.jpg',
	])
	useMemo(() => {
		sand.wrapS = sand.wrapT = RepeatWrapping
		sand.colorSpace = SRGBColorSpace
		sandNormal.wrapS = sandNormal.wrapT = RepeatWrapping
	}, [sand, sandNormal])
	return [sand, sandNormal]
}

function CurvedBerm({ origin, yaw, cx, cz, innerR, outerR, highInner }) {
	const [sand, sandNormal] = useMudTextures()
	const geometry = useMemo(() => {
		const geo = new RingGeometry(innerR, outerR, 32, 8, 0, Math.PI / 2)
		geo.rotateX(Math.PI / 2)
		geo.rotateY(Math.PI / 2)
		const pos = geo.attributes.position
		const uv = geo.attributes.uv
		const colors = []
		const cos = Math.cos(yaw)
		const sin = Math.sin(yaw)
		const span = outerR - innerR
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i)
			const z = pos.getZ(i)
			const r = Math.hypot(x, z)
			const t = (r - innerR) / span
			const wx = origin[0] + (cx + x) * cos + (cz + z) * sin
			const wz = origin[2] - (cx + x) * sin + (cz + z) * cos
			const lumps =
				Math.sin(wx * 1.4 + wz * 0.55) * 0.045 +
				Math.sin(wz * 2.1 + wx * 0.8) * 0.03
			const h = (highInner ? 1 - t : t) * BERM_H
			pos.setY(i, h + lumps)
			uv.setXY(i, wx / 6, wz / 6)
			colors.push(1.0, 0.77, 0.48)
		}
		geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
		geo.computeVertexNormals()
		return geo
	}, [origin, yaw, cx, cz, innerR, outerR, highInner])

	return (
		<RigidBody type='fixed' colliders='trimesh'>
			<mesh geometry={geometry} position={[cx, 0.32, cz]} receiveShadow>
				<meshStandardMaterial
					map={sand}
					normalMap={sandNormal}
					vertexColors
					color='#5a3d22'
					roughness={0.95}
					metalness={0.02}
				/>
			</mesh>
		</RigidBody>
	)
}

function CurvedFence({ cx, cz, radius }) {
	const half = SIZE / 2
	const segs = []
	for (let i = 0; i < OSEG; i++) segs.push(((i + 0.5) / OSEG) * (Math.PI / 2))
	const posts = []
	for (let i = 0; i <= OSEG; i++) posts.push((i / OSEG) * (Math.PI / 2))
	const chord = 2 * radius * Math.sin(Math.PI / 4 / OSEG) + 0.08
	const rails = [0.32, 0.62, 0.92, 1.22, 1.52]

	return (
		<>
			<RigidBody type='fixed' colliders={false}>
				{segs.map((t, i) => (
					<CuboidCollider
						key={i}
						args={[0.12, 1.6, chord / 2]}
						position={[cx + radius * Math.cos(t), 2.2, cz + radius * Math.sin(t)]}
						rotation={[0, -t, 0]}
					/>
				))}
			</RigidBody>
			{posts.map((t, i) => (
				<mesh key={`p-${i}`} position={[cx + radius * Math.cos(t), LAYER_HEIGHT / 2, cz + radius * Math.sin(t)]}>
					<boxGeometry args={[0.14, LAYER_HEIGHT, 0.14]} />
					<meshStandardMaterial color='#3f3f46' metalness={0.6} roughness={0.4} />
				</mesh>
			))}
			{rails.map((y) =>
				segs.map((t, i) => (
					<mesh
						key={`r-${y}-${i}`}
						position={[cx + radius * Math.cos(t), y, cz + radius * Math.sin(t)]}
						rotation={[0, -t, 0]}
					>
						<boxGeometry args={[0.12, 0.22, chord]} />
						<meshStandardMaterial color='#d4d4d8' metalness={0.8} roughness={0.3} />
					</mesh>
				))
			)}
			{segs.map((t, i) => (
				<mesh
					key={`f-${i}`}
					position={[cx + radius * Math.cos(t), 2.25, cz + radius * Math.sin(t)]}
					rotation={[0, -t, 0]}
				>
					<boxGeometry args={[0.03, 1.4, chord]} />
					<meshStandardMaterial color='#a1a1aa' transparent opacity={0.35} />
				</mesh>
			))}
		</>
	)
}

export default function Corner({ position = [0, 0, 0], rotation = 0 }) {
	const half = SIZE / 2
	const cx = -half
	const cz = -half
	const inner = SIZE - WALL * 2

	return (
		<group position={position} rotation={[0, rotation, 0]}>
			<MudRoad width={inner} length={SIZE + 0.35} origin={position} yaw={rotation} />
			<group rotation={[0, Math.PI / 2, 0]}>
				<MudRoad width={inner} length={SIZE + 0.35} origin={position} yaw={rotation + Math.PI / 2} />
			</group>

			<CurvedBerm
				origin={position}
				yaw={rotation}
				cx={cx}
				cz={cz}
				innerR={0.25}
				outerR={BERM_W}
				highInner
			/>
			<CurvedBerm
				origin={position}
				yaw={rotation}
				cx={cx}
				cz={cz}
				innerR={SIZE - BERM_W}
				outerR={SIZE}
				highInner={false}
			/>

			<CurvedFence cx={cx} cz={cz} radius={INNER_R} />
			<CurvedFence cx={cx} cz={cz} radius={OUTER_R} />
		</group>
	)
}