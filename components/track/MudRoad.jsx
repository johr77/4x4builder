import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { PlaneGeometry, TextureLoader, RepeatWrapping, SRGBColorSpace, Float32BufferAttribute } from 'three'

export default function MudRoad({ width, length, origin = [0, 0, 0], yaw = 0, corner = false }) {
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
		const geo = new PlaneGeometry(width, length, 36, 36)
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

			const rutZ =
				Math.exp(-((x + 1.15) ** 2) / (2 * 0.38 ** 2)) + Math.exp(-((x - 1.15) ** 2) / (2 * 0.38 ** 2))
			const rutX = corner
				? Math.exp(-((z + 1.15) ** 2) / (2 * 0.38 ** 2)) + Math.exp(-((z - 1.15) ** 2) / (2 * 0.38 ** 2))
				: 0
			const rut = Math.max(rutZ, rutX)
			const wave = 0.82 + 0.18 * Math.sin(wx * 1.7 + wz * 0.4)
			const depth = 0.22 * rut * wave
			const lumps =
				Math.sin(wx * 1.4 + wz * 0.55) * 0.045 +
				Math.sin(wz * 2.1 + wx * 0.8) * 0.03 +
				Math.sin((wx + wz) * 3.3) * 0.015

			pos.setY(i, Math.max(lumps - depth, -0.12))
			uv.setXY(i, wx / 6, wz / 6)

			const wet = Math.min(1, depth * 4)
			colors.push(0.55 + (1 - wet) * 0.45, 0.42 + (1 - wet) * 0.35, 0.28 + (1 - wet) * 0.2)
		}

		geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
		geo.computeVertexNormals()
		return geo
	}, [width, length, origin, yaw, corner])

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