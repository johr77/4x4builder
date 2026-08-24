import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { PlaneGeometry, TextureLoader, RepeatWrapping, SRGBColorSpace, Float32BufferAttribute } from 'three'
import { SIZE, LAYER_HEIGHT, WALL, START_PEAK, START_LEN } from './TrackConstants'

const SEGS_Z = 56
const SEGS_X = 10
const WSEGS = 16

function startHeight(z) {
	const half = START_LEN / 2
	const u = z + half
	const a0 = 3.5
	const up = 7.5
	const flat = 10
	const down = 7.5
	const kickerStart = a0 + up + flat - 2.0

	if (u < a0) return 0
	if (u < a0 + up) {
		const t = (u - a0) / up
		const s = t * t * (3 - 2 * t)
		return START_PEAK * s
	}
	if (u < a0 + up + flat) {
		let h = START_PEAK
		if (u > kickerStart) {
			const k = (u - kickerStart) / 2.0
			h += 0.4 * k * k
		}
		return h
	}
	if (u < a0 + up + flat + down) {
		const t = (u - a0 - up - flat) / down
		const s = t * t * (3 - 2 * t)
		return (START_PEAK + 0.4) * (1 - s)
	}
	return 0
}

const PLATEAU_Z = -START_LEN / 2 + 3.5 + 7.5 + 5

export default function Start({ position = [0, 0, 0], rotation = 0, innerSign = 1 }) {
	const halfW = SIZE / 2
	const halfL = START_LEN / 2
	const inner = SIZE - WALL * 2
	const innerX = innerSign * (halfW - 0.28)
	const outerX = -innerX

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
		const geo = new PlaneGeometry(inner, START_LEN, SEGS_X, SEGS_Z)
		geo.rotateX(-Math.PI / 2)
		const pos = geo.attributes.position
		const uv = geo.attributes.uv
		const colors = []
		const cos = Math.cos(rotation)
		const sin = Math.sin(rotation)

		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i)
			const z = pos.getZ(i)
			pos.setY(i, startHeight(z))
			const wx = position[0] + x * cos + z * sin
			const wz = position[2] - x * sin + z * cos
			uv.setXY(i, wx / 6, wz / 6)
			colors.push(0.62, 0.46, 0.28)
		}
		geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
		geo.computeVertexNormals()
		return geo
	}, [inner, position, rotation])

	const wallSegs = []
	for (let i = 0; i < WSEGS; i++) {
		const z0 = -halfL + (i * START_LEN) / WSEGS
		const z1 = z0 + START_LEN / WSEGS
		const z = (z0 + z1) / 2
		wallSegs.push({ z, len: START_LEN / WSEGS + 0.06, h: startHeight(z) })
	}

	return (
		<group position={position} rotation={[0, rotation, 0]}>
			<RigidBody type='fixed' colliders='trimesh'>
				<mesh geometry={geometry} position={[0, 0.32, 0]} receiveShadow>
					<meshStandardMaterial
						map={sand}
						normalMap={sandNormal}
						vertexColors
						color='#5a3d22'
						roughness={0.95}
					/>
				</mesh>
			</RigidBody>

			<group position={[0, START_PEAK + 0.36, PLATEAU_Z]}>
				{[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((i) => (
					<mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[i * 0.62, 0, 0]}>
						<planeGeometry args={[0.5, 1.4]} />
						<meshStandardMaterial color={i % 2 === 0 ? '#f8fafc' : '#111111'} />
					</mesh>
				))}
			</group>

			<RigidBody type='fixed' colliders={false}>
				{wallSegs.map((s, i) => (
					<group key={i}>
						<CuboidCollider args={[0.2, 0.55, s.len / 2]} position={[innerX, s.h + 0.55, s.z]} />
						<CuboidCollider args={[0.2, LAYER_HEIGHT / 2, s.len / 2]} position={[outerX, s.h + LAYER_HEIGHT / 2, s.z]} />
					</group>
				))}
			</RigidBody>

			{wallSegs.map((s, i) => (
				<group key={`iw-${i}`}>
					<mesh position={[innerX, s.h + 0.55, s.z]} castShadow>
						<boxGeometry args={[0.38, 1.1, s.len]} />
						<meshStandardMaterial color='#1d4ed8' />
					</mesh>
					<mesh position={[innerX - innerSign * 0.32, s.h + 1.05, s.z]}>
						<boxGeometry args={[0.1, 2.1, 0.1]} />
						<meshStandardMaterial color='#f3f4f6' />
					</mesh>
				</group>
			))}

			{wallSegs.map((s, i) => (
				<group key={`ow-${i}`}>
					<mesh position={[outerX, s.h + LAYER_HEIGHT / 2, s.z]} castShadow>
						<boxGeometry args={[0.14, LAYER_HEIGHT, 0.14]} />
						<meshStandardMaterial color='#3f3f46' />
					</mesh>
					{[0.32, 0.62, 0.92, 1.22, 1.52].map((y) => (
						<mesh key={y} position={[outerX, s.h + y, s.z]}>
							<boxGeometry args={[0.12, 0.22, s.len]} />
							<meshStandardMaterial color='#d4d4d8' metalness={0.8} roughness={0.3} />
						</mesh>
					))}
					<mesh position={[outerX, s.h + 2.25, s.z]}>
						<boxGeometry args={[0.03, 1.4, s.len]} />
						<meshStandardMaterial color='#a1a1aa' transparent opacity={0.35} />
					</mesh>
				</group>
			))}
		</group>
	)
}