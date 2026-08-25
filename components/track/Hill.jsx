import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { PlaneGeometry, TextureLoader, RepeatWrapping, SRGBColorSpace, Float32BufferAttribute } from 'three'
import { SIZE, LAYER_HEIGHT, WALL, START_PEAK } from './TrackConstants'
import OuterWall from './OuterWall'

function hillHeight(z, from, to) {
	const t = (z + SIZE / 2) / SIZE
	const s = t * t * (3 - 2 * t)
	return from + (to - from) * s
}

export default function Hill({ position = [0, 0, 0], rotation = 0, innerSign = 1, from = 0, to = START_PEAK }) {
	const half = SIZE / 2
	const inner = SIZE - WALL * 2
	const innerX = innerSign * (half - 0.28)
	const outerX = -innerX
	const rise = to - from
	const wallAngle = Math.atan2(rise, SIZE)
	const wallLen = Math.hypot(SIZE, rise)
	const wallY = (from + to) / 2 + 0.55

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
		const geo = new PlaneGeometry(inner, SIZE, 8, 28)
		geo.rotateX(-Math.PI / 2)
		const pos = geo.attributes.position
		const uv = geo.attributes.uv
		const colors = []
		const cos = Math.cos(rotation)
		const sin = Math.sin(rotation)
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i)
			const z = pos.getZ(i)
			pos.setY(i, hillHeight(z, from, to))
			uv.setXY(i, (position[0] + x * cos + z * sin) / 6, (position[2] - x * sin + z * cos) / 6)
			colors.push(0.62, 0.46, 0.28)
		}
		geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
		geo.computeVertexNormals()
		return geo
	}, [inner, position, rotation, from, to])

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
				<CuboidCollider
					args={[0.2, 0.55, wallLen / 2]}
					position={[innerX, wallY, 0]}
					rotation={[-wallAngle, 0, 0]}
				/>
				<CuboidCollider args={[0.2, LAYER_HEIGHT / 2, half - 0.05]} position={[outerX, LAYER_HEIGHT / 2, 0]} />
			</RigidBody>

			{/* one sloped inner wall — no stairs */}
			<mesh position={[innerX, wallY, 0]} rotation={[-wallAngle, 0, 0]} castShadow>
				<boxGeometry args={[0.38, 1.1, wallLen]} />
				<meshStandardMaterial color='#1d4ed8' />
			</mesh>

			<group position={[outerX, 0, 0]} rotation={[0, outerX > 0 ? 0 : Math.PI, 0]}>
				<OuterWall length={SIZE - 0.15} />
			</group>
		</group>
	)
}