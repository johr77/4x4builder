import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { PlaneGeometry, TextureLoader, RepeatWrapping, SRGBColorSpace, Float32BufferAttribute } from 'three'
import { SIZE, LAYER_HEIGHT, WALL, START_PEAK } from './TrackConstants'
import OuterWall from './OuterWall'

const SEGS_Z = 28
const WSEGS = 8

function hillHeight(z, down) {
	const t = (z + SIZE / 2) / SIZE
	const s = t * t * (3 - 2 * t)
	return START_PEAK * (down ? 1 - s : s)
}

export default function Hill({ position = [0, 0, 0], rotation = 0, innerSign = 1, down = false }) {
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
			pos.setY(i, hillHeight(z, down))
			uv.setXY(i, (position[0] + x * cos + z * sin) / 6, (position[2] - x * sin + z * cos) / 6)
			colors.push(0.62, 0.46, 0.28)
		}
		geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
		geo.computeVertexNormals()
		return geo
	}, [inner, position, rotation, down])

	const wallSegs = []
	for (let i = 0; i < WSEGS; i++) {
		const z = -half + ((i + 0.5) * SIZE) / WSEGS
		wallSegs.push({ z, len: SIZE / WSEGS + 0.05, h: hillHeight(z, down) })
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
					<CuboidCollider key={i} args={[0.2, 0.55, s.len / 2]} position={[innerX, s.h + 0.55, s.z]} />
				))}
				<CuboidCollider args={[0.2, LAYER_HEIGHT / 2, half]} position={[outerX, LAYER_HEIGHT / 2, 0]} />
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

			<group position={[outerX, 0, 0]} rotation={[0, outerX > 0 ? 0 : Math.PI, 0]}>
				<OuterWall />
			</group>
		</group>
	)
}