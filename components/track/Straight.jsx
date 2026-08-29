import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { PlaneGeometry, TextureLoader, RepeatWrapping, SRGBColorSpace, Float32BufferAttribute } from 'three'
import { SIZE, WALL } from './TrackConstants'
import MudRoad from './MudRoad'
import OuterWall from './OuterWall'

const BERM_W = 3
const BERM_H = 0.3

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

function DirtBerm({ origin, yaw }) {
	const [sand, sandNormal] = useMudTextures()
	const geometry = useMemo(() => {
		const geo = new PlaneGeometry(BERM_W, SIZE, 20, 28)
		geo.rotateX(-Math.PI / 2)
		const pos = geo.attributes.position
		const uv = geo.attributes.uv
		const colors = []
		const cos = Math.cos(yaw)
		const sin = Math.sin(yaw)
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i)
			const z = pos.getZ(i)
			const t = (x + BERM_W / 2) / BERM_W
			const wx = origin[0] + x * cos + z * sin
			const wz = origin[2] - x * sin + z * cos
			const lumps =
				Math.sin(wx * 1.4 + wz * 0.55) * 0.045 +
				Math.sin(wz * 2.1 + wx * 0.8) * 0.03 +
				Math.sin((wx + wz) * 3.3) * 0.015
			pos.setY(i, t * BERM_H + lumps)
			uv.setXY(i, wx / 6, wz / 6)
			// same dry-road vertex color as MudRoad
			colors.push(1.0, 0.77, 0.48)
		}
		geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
		geo.computeVertexNormals()
		return geo
	}, [origin, yaw])

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

export default function Straight({ position = [0, 0, 0], rotation = 0, innerSign = -1 }) {
	const half = SIZE / 2
	const inner = SIZE - WALL * 2
	const innerX = innerSign * (half - BERM_W / 2)
	const outerX = -innerSign * (half - BERM_W / 2)
	const innerFenceX = innerSign * (half - 0.06)
	const outerFenceX = -innerSign * (half - 0.06)

	return (
		<group position={position} rotation={[0, rotation, 0]}>
			<MudRoad width={inner} length={SIZE} origin={position} yaw={rotation} />

			<group position={[innerX, 0, 0]} rotation={[0, innerSign === 1 ? 0 : Math.PI, 0]}>
				<DirtBerm origin={position} yaw={rotation} />
			</group>
			<group position={[outerX, 0, 0]} rotation={[0, innerSign === -1 ? 0 : Math.PI, 0]}>
				<DirtBerm origin={position} yaw={rotation} />
			</group>

			<RigidBody type='fixed' colliders={false}>
				<CuboidCollider args={[0.12, 1.6, half]} position={[innerFenceX, 2.2, 0]} />
				<CuboidCollider args={[0.12, 1.6, half]} position={[outerFenceX, 2.2, 0]} />
			</RigidBody>
			<group position={[innerFenceX, 0, 0]} rotation={[0, innerFenceX > 0 ? 0 : Math.PI, 0]}>
				<OuterWall />
			</group>
			<group position={[outerFenceX, 0, 0]} rotation={[0, outerFenceX > 0 ? 0 : Math.PI, 0]}>
				<OuterWall />
			</group>
		</group>
	)
}