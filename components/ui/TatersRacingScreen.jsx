import { useNavigate } from 'react-router-dom'

export default function TatersRacingScreen() {
	const navigate = useNavigate()

	return (
		<div
			style={{
				minHeight: '100vh',
				width: '100%',
				background: 'linear-gradient(180deg, #1a1208 0%, #3d2a14 50%, #1a1208 100%)',
				color: '#f4e6c8',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: 'system-ui, sans-serif',
				textAlign: 'center',
				padding: '24px',
			}}
		>
			<p style={{ letterSpacing: '0.35em', fontSize: 12, opacity: 0.7, marginBottom: 12 }}>DIRT TRACK · JUMPS · HILLS</p>
			<h1 style={{ fontSize: 'clamp(32px, 6vw, 64px)', margin: '0 0 8px', lineHeight: 1.1 }}>
				Tater&apos;s 4x4 Racing
			</h1>
			<p style={{ opacity: 0.75, marginBottom: 40 }}>Launch screen — track coming next</p>

			<button
				onClick={() => navigate('/taters/races')}
				style={{
					background: '#c2410c',
					color: 'white',
					border: 'none',
					borderRadius: 8,
					padding: '14px 48px',
					fontSize: 18,
					fontWeight: 700,
					cursor: 'pointer',
					marginBottom: 16,
					minWidth: 260,
				}}
			>
				PLAY
                
			</button>

			
<button
				onClick={() => navigate('/')}
				style={{
					background: 'transparent',
					color: '#f4e6c8',
					border: '1px solid #f4e6c855',
					borderRadius: 8,
					padding: '12px 48px',
					fontSize: 16,
					cursor: 'pointer',
					minWidth: 260,
				}}
			>
				Home
			</button>

			<button
				onClick={() => navigate('/taters/settings')}
				style={{
					background: 'transparent',
					color: '#f4e6c8',
					border: '1px solid #f4e6c855',
					borderRadius: 8,
					padding: '12px 48px',
					fontSize: 16,
					cursor: 'pointer',
					minWidth: 260,
					marginBottom: 16,
				}}
			>
				Settings
			</button>
            
		</div>
	)
}