import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { PlaneGeometry, TextureLoader, RepeatWrapping, SRGBColorSpace, Float32BufferAttribute } from 'three'
import { SIZE, LAYER_HEIGHT, WALL, START_PEAK } from './TrackConstants'

const SEGS_Z = 28
const WSEGS = 8

function hillHeight(z) {
	const t = (z + SIZE / 2) / SIZE
	const s = t * t * (3 - 2 * t)
	return START_PEAK * s
}

export default function Hill({ position = [0, 0, 0], rotation = 0, innerSign = 1 }) {
	const half = SIZE / 2
	const inner = SIZE - WALL * 2
	const innerX = innerSign * (half - 0.28)
	const outerX = -innerX

	const [sand, sandNormal] = useLoader(TextureLoader, [
		'/assets/images/ground/sand.jpg',
		'/assets/images/ground/sand_normal.jpg',
	])

	useMemo(() => {
		sand.wrapS = sand.wrapT = RepeatWrapping
		sand.colorSpace = SRGBColorSpace
		sandNormal.wrapS = sandNormal.wrapT = RepeatWrapping
	}, [sand, sandNormal])

	const geometry = useMemo(() => {
		const geo = new PlaneGeometry(inner, SIZE, 8, SEGS_Z)
		geo.rotateX(-Math.PI / 2)
		const pos = geo.attributes.position
		const uv = geo.attributes.uv
		const colors = []
		const cos = Math.cos(rotation)
		const sin = Math.sin(rotation)
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i)
			const z = pos.getZ(i)
			pos.setY(i, hillHeight(z))
			uv.setXY(i, (position[0] + x * cos + z * sin) / 6, (position[2] - x * sin + z * cos) / 6)
			colors.push(0.62, 0.46, 0.28)
		}
		geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
		geo.computeVertexNormals()
		return geo
	}, [inner, position, rotation])

	const wallSegs = []
	for (let i = 0; i < WSEGS; i++) {
		const z = -half + ((i + 0.5) * SIZE) / WSEGS
		wallSegs.push({ z, len: SIZE / WSEGS + 0.05, h: hillHeight(z) })
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

			<RigidBody type='fixed' colliders={false}>
				{wallSegs.map((s, i) => (
					<group key={i}>
						<CuboidCollider args={[0.2, 0.55, s.len / 2]} position={[innerX, s.h + 0.55, s.z]} />
						<CuboidCollider args={[0.2, LAYER_HEIGHT / 2, s.len / 2]} position={[outerX, s.h + LAYER_HEIGHT / 2, s.z]} />
					</group>
				))}
			</RigidBody>

			{wallSegs.map((s, i) => (
				<group key={`w-${i}`}>
					<mesh position={[innerX, s.h + 0.55, s.z]} castShadow>
						<boxGeometry args={[0.38, 1.1, s.len]} />
						<meshStandardMaterial color='#1d4ed8' />
					</mesh>
					<mesh position={[innerX - innerSign * 0.32, s.h + 1.05, s.z]}>
						<boxGeometry args={[0.1, 2.1, 0.1]} />
						<meshStandardMaterial color='#f3f4f6' />
					</mesh>
					<mesh position={[outerX, s.h + LAYER_HEIGHT / 2, s.z]}>
						<boxGeometry args={[0.14, LAYER_HEIGHT, 0.14]} />
						<meshStandardMaterial color='#3f3f46' />
					</mesh>
					{[0.32, 0.62, 0.92, 1.22, 1.52].map((y) => (
						<mesh key={y} position={[outerX, s.h + y, s.z]}>
							<boxGeometry args={[0.12, 0.22, s.len]} />
							<meshStandardMaterial color='#d4d4d8' metalness={0.8} roughness={0.3} />
						</mesh>
					))}
				</group>
			))}
		</group>
	)
}