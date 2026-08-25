import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { PlaneGeometry, TextureLoader, RepeatWrapping, SRGBColorSpace, Float32BufferAttribute } from 'three'
import { SIZE, LAYER_HEIGHT, WALL, START_PEAK } from './TrackConstants'
import OuterWall from './OuterWall'

function hillHeight(z, from, to) {
	const t = Math.min(1, Math.max(0, (z + SIZE / 2) / SIZE))
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
	const meshLen = SIZE + 0.5

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
		const geo = new PlaneGeometry(inner, meshLen, 8, 28)
		geo.rotateX(-Math.PI / 2)
		const pos = geo.attributes.position
		const uv = geo.attributes.uv
		const colors = []
		const cos = Math.cos(rotation)
		const sin = Math.sin(rotation)
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i)
			const z = pos.getZ(i)
			const wx = position[0] + x * cos + z * sin
			const wz = position[2] - x * sin + z * cos
						const rut =
				Math.exp(-Math.pow((wz % 3) - 1.1, 2) / 0.3) * 0.5 +
				Math.exp(-Math.pow((wz % 3) + 1.1, 2) / 0.3) * 0.5
			pos.setY(i, hillHeight(z, from, to) + Math.max(0.04 * Math.sin(wx * 2 + wz) - 0.08 * rut, -0.08))
			uv.setXY(i, wx / 6, wz / 6)
			const wet = Math.min(1, rut)
			colors.push(0.55 + (1 - wet) * 0.45, 0.42 + (1 - wet) * 0.35, 0.28 + (1 - wet) * 0.2)
		}
		geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
		geo.computeVertexNormals()
		return geo
	}, [inner, position, rotation, from, to, meshLen])

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