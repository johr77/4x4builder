import useGameStore from '../../store/gameStore'
import VehicleSwitcher from './VehicleSwitcher'
import VolumeOnIcon from '../../assets/images/icons/VolumeOn.svg'
import VolumeOffIcon from '../../assets/images/icons/VolumeOff.svg'
import { useNavigate } from 'react-router-dom'

function Header() {
	const muted = useGameStore((state) => state.muted)
	const toggleMute = useGameStore((state) => state.toggleMute)
	const navigate = useNavigate()
	return (
		<div id='header' className='absolute top-0 h-15 grid grid-cols-[1fr_auto_1fr] items-stretch w-full border-none z-50 text-stone-900'>
			<div />

			<div className='min-w-0 justify-self-center flex items-center justify-center'>
				<VehicleSwitcher />
			</div>

						<div className='px-5 flex justify-end items-center gap-3'>
				<button
					onClick={() => navigate('/taters')}
					style={{
						background: '#c2410c',
						color: 'white',
						border: 'none',
						borderRadius: 6,
						padding: '8px 12px',
						fontSize: 13,
						fontWeight: 700,
						cursor: 'pointer',
						whiteSpace: 'nowrap',
					}}
				>
					Tater&apos;s 4x4 Racing
				</button>
				<div onClick={toggleMute} className='text-stone-900/20 cursor-pointer' title={muted ? 'Unmute' : 'Mute'}>
					{muted ? <VolumeOffIcon className='icon' /> : <VolumeOnIcon className='icon' />}
				</div>
			</div>
		</div>
	)
}

export default Header
