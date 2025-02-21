import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'AI Pop-Cycle';
export const size = {
  width: 1200,
  height: 630,
};

// Image generation
export default function Image() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: '#FFFBF7',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={new URL('../public/images/ai_pop_cycle.png', import.meta.url).toString()}
          alt="AI Pop-Cycle"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
} 