import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { PlaneGeometry, TextureLoader, RepeatWrapping, SRGBColorSpace, Float32BufferAttribute } from 'three'

export default function MudRoad({ width, length, origin = [0, 0, 0], yaw = 0 }) {
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
		const along0 = origin[0] * Math.sin(yaw) + origin[2] * Math.cos(yaw)

		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i)
			const z = pos.getZ(i)
			const along = along0 + z

			const rutA = Math.exp(-((x + 1.15) ** 2) / (2 * 0.38 ** 2))
			const rutB = Math.exp(-((x - 1.15) ** 2) / (2 * 0.38 ** 2))
			const wave = 0.82 + 0.18 * Math.sin(along * 1.7 + x * 0.4)
			const depth = 0.22 * (rutA + rutB) * wave
			const lumps =
				Math.sin(x * 1.4 + along * 0.55) * 0.045 +
				Math.sin(along * 2.1 + x * 0.8) * 0.03 +
				Math.sin((x + along) * 3.3) * 0.015

			pos.setY(i, lumps - depth)
			uv.setXY(i, x / 6, along / 6)

			const wet = Math.min(1, depth * 4)
			colors.push(0.55 + (1 - wet) * 0.45, 0.42 + (1 - wet) * 0.35, 0.28 + (1 - wet) * 0.2)
		}

		geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
		geo.computeVertexNormals()
		return geo
	}, [width, length, origin, yaw])

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