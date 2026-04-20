import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage() {
  const logoPath = path.join(process.cwd(), 'public', 'logo.png');
  const logoData = readFileSync(logoPath);
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

  const badges = ['Licensed & Insured', 'Eco-Friendly', '4.9★ Rated', 'Same-Week'];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#022c22',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            backgroundColor: '#059669',
            opacity: 0.15,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            opacity: 0.1,
            display: 'flex',
          }}
        />

        {/* Top — logo + brand name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '18px',
              backgroundColor: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <img
              src={logoSrc}
              width={56}
              height={56}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <span
            style={{
              fontSize: '34px',
              fontWeight: 700,
              color: '#6ee7b7',
              letterSpacing: '-0.5px',
            }}
          >
            Honor Cleaning
          </span>
        </div>

        {/* Middle — headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              fontSize: '80px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.05,
              letterSpacing: '-2px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>Commercial Cleaning</span>
            <span style={{ color: '#34d399' }}>for Greater Boston</span>
          </div>
          <p
            style={{
              fontSize: '30px',
              color: '#a7f3d0',
              margin: 0,
              letterSpacing: '0.5px',
            }}
          >
            Office · Retail · Medical · Industrial
          </p>
        </div>

        {/* Bottom — badges + URL */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            {badges.map((badge) => (
              <div
                key={badge}
                style={{
                  backgroundColor: '#047857',
                  color: '#d1fae5',
                  padding: '10px 22px',
                  borderRadius: '100px',
                  fontSize: '18px',
                  fontWeight: 600,
                  display: 'flex',
                  border: '1px solid #059669',
                }}
              >
                {badge}
              </div>
            ))}
          </div>
          <span
            style={{
              fontSize: '22px',
              color: '#6ee7b7',
              opacity: 0.7,
            }}
          >
            honorcleaning.com
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
