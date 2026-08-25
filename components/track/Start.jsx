import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { TextureLoader, RepeatWrapping, SRGBColorSpace } from 'three'
import { SIZE, LAYER_HEIGHT, WALL, START_PEAK } from './TrackConstants'
import InnerWall from './InnerWall'
import OuterWall from './OuterWall'

const ROAD_Y = 0.32 + START_PEAK

export default function Start({ position = [0, 0, 0], rotation = 0, innerSign = 1 }) {
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
		sand.repeat.set(SIZE / 6, SIZE / 6)
		sand.colorSpace = SRGBColorSpace
		sandNormal.wrapS = sandNormal.wrapT = RepeatWrapping
		sandNormal.repeat.set(SIZE / 6, SIZE / 6)
	}, [sand, sandNormal])

	return (
		<group position={position} rotation={[0, rotation, 0]}>
			<mesh position={[0, ROAD_Y / 2, 0]} receiveShadow>
				<boxGeometry args={[inner, ROAD_Y, SIZE]} />
				<meshStandardMaterial color='#5a3d22' roughness={0.95} />
			</mesh>
			<mesh position={[0, ROAD_Y + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
				<planeGeometry args={[inner, SIZE]} />
				<meshStandardMaterial
					map={sand}
					normalMap={sandNormal}
					color='#5a3d22'
					roughness={0.95}
				/>
			</mesh>

			<group position={[0, ROAD_Y + 0.03, 0]}>
				{[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((i) => (
					<mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[i * 0.62, 0, 0]}>
						<planeGeometry args={[0.5, 1.4]} />
						<meshStandardMaterial color={i % 2 === 0 ? '#f8fafc' : '#111111'} />
					</mesh>
				))}
			</group>

			<RigidBody type='fixed' colliders={false}>
				<CuboidCollider args={[inner / 2, 0.2, half]} position={[0, ROAD_Y, 0]} />
				<CuboidCollider args={[0.2, 0.55, half]} position={[innerX, ROAD_Y + 0.55, 0]} />
				<CuboidCollider args={[0.2, LAYER_HEIGHT / 2, half]} position={[outerX, LAYER_HEIGHT / 2, 0]} />
			</RigidBody>

			<group position={[innerX, START_PEAK, 0]} rotation={[0, innerSign === 1 ? Math.PI : 0, 0]}>
				<InnerWall />
			</group>
			{/* outer fence stays on the ground */}
			<group position={[outerX, 0, 0]} rotation={[0, outerX > 0 ? 0 : Math.PI, 0]}>
				<OuterWall />
			</group>
		</group>
	)
}