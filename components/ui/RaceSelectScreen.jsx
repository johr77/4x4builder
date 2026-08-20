import { useNavigate } from 'react-router-dom'

export default function RaceSelectScreen() {
	const navigate = useNavigate()

	const screen = {
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
	}

	const btn = {
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
	}

	return (
		<div style={screen}>
			<p style={{ letterSpacing: '0.35em', fontSize: 12, opacity: 0.7, marginBottom: 12 }}>SELECT RACE</p>
			<h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', margin: '0 0 32px' }}>Tater&apos;s 4x4 Racing</h1>

			<button style={btn} onClick={() => navigate('/taters/race/1')}>
				Race 1
			</button>

			<button
				onClick={() => navigate('/taters')}
				style={{ ...btn, background: 'transparent', border: '1px solid #f4e6c855', color: '#f4e6c8' }}
			>
				Back
			</button>
		</div>
	)
}