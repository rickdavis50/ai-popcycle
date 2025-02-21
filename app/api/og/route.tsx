import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFBF7',
          padding: '40px',
        }}
      >
        <img 
          src="https://your-domain.com/images/pop_logo.svg" 
          alt="AI Pop-Cycle"
          width="600"
          height="146"
        />
        <div
          style={{
            fontSize: 60,
            fontFamily: 'Montserrat',
            background: 'linear-gradient(to right, #FF7300, #78401F)',
            backgroundClip: 'text',
            color: 'transparent',
            marginTop: 40,
          }}
        >
          Super Cycle Melt Monitor
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
} 