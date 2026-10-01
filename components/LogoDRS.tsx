/**
 * LogoDRS — Tenta carregar /logo-drs.png.
 * Se o arquivo não existir, exibe o fallback textual automaticamente.
 *
 * INSTRUÇÃO: renomeie "Logo Drs.png" → "logo-drs.png" dentro de /public/
 */

'use client';
import { useState } from 'react';

interface Props {
  size?:  'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
}

const heights: Record<string, string> = { sm: '28px', md: '40px', lg: '120px' };
const subSizes: Record<string, string> = { sm: '5.5px', md: '7px', lg: '14px' };

export default function LogoDRS({ size = 'md', align = 'left' }: Props) {
  const [imgError, setImgError] = useState(false);
  const textAlign = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';

  if (!imgError) {
    return (
      <div style={{ textAlign }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-drs.png"
          alt="DRS Advogados Associados"
          onError={() => setImgError(true)}
          style={{
            height:     heights[size],
            maxWidth:   '160px',
            objectFit:  'contain',
            display:    'inline-block',
          }}
        />
      </div>
    );
  }

  /* ── Fallback textual ────────────────────────────────────────────── */
  return (
    <div style={{ textAlign, lineHeight: 1 }}>
      <div
        style={{
          fontSize:      size === 'lg' ? '64px' : size === 'md' ? '22px' : '16px',
          fontWeight:    900,
          color:         '#ffffff',
          letterSpacing: '-0.02em',
          lineHeight:    1,
        }}
      >
        DRS
      </div>
      <div
        style={{
          fontSize:      subSizes[size],
          fontWeight:    700,
          color:         'rgba(255,255,255,0.5)',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          marginTop:     '3px',
        }}
      >
        Advogados Associados
      </div>
    </div>
  );
}
