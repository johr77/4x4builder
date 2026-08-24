import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { RingGeometry, TextureLoader, RepeatWrapping, SRGBColorSpace, Float32BufferAttribute } from 'three'

export default function MudCorner({ innerR, outerR, origin = [0, 0, 0], yaw = 0 }) {
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
		const geo = new RingGeometry(innerR, outerR, 32, 8, 0, Math.PI / 2)
		geo.rotateX(-Math.PI / 2)
		const pos = geo.attributes.position
		const uv = geo.attributes.uv
		const colors = []
		const cos = Math.cos(yaw)
		const sin = Math.sin(yaw)

		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i)
			const z = pos.getZ(i)
			const wx = origin[0] + x * cos + z * sin
			const wz = origin[2] - x * sin + z * cos
			const r = Math.hypot(x, z)
			const mid = (innerR + outerR) / 2
			const rut =
				Math.exp(-((r - (mid - 1.1)) ** 2) / (2 * 0.38 ** 2)) +
				Math.exp(-((r - (mid + 1.1)) ** 2) / (2 * 0.38 ** 2))
			const depth = 0.18 * rut
			const lumps = Math.sin(wx * 1.4 + wz * 0.55) * 0.04 + Math.sin(wz * 2.1 + wx * 0.8) * 0.025
			pos.setY(i, Math.max(lumps - depth, -0.12))
			uv.setXY(i, wx / 6, wz / 6)
			const wet = Math.min(1, depth * 4)
			colors.push(0.55 + (1 - wet) * 0.45, 0.42 + (1 - wet) * 0.35, 0.28 + (1 - wet) * 0.2)
		}

		geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
		geo.computeVertexNormals()
		return geo
	}, [innerR, outerR, origin, yaw])

	return (
		<RigidBody type='fixed' colliders='trimesh'>
			<mesh geometry={geometry} position={[0, 0.32, 0]} receiveShadow>
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