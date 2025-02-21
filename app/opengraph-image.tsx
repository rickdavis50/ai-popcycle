import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'AI Pop-Cycle';
export const size = {
  width: 1200,
  height: 630,
};

export default async function Image() {
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          <img
            src={new URL('../public/images/pop_logo.svg', import.meta.url).toString()}
            alt="AI Pop-Cycle Logo"
            width="200"
            height="200"
          />
          <h1 style={{
            fontSize: 64,
            fontFamily: 'Montserrat',
            color: '#FF7300',
          }}>
            AI Pop-Cycle
          </h1>
        </div>
        <p style={{
          fontSize: 32,
          fontFamily: 'Montserrat',
          color: '#78401F',
          marginTop: 24,
        }}>
          Super Cycle Melt Monitor
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
} 