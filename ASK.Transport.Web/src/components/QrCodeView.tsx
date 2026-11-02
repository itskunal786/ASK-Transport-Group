import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface QrCodeViewProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export const QrCodeView: React.FC<QrCodeViewProps> = ({
  value,
  size = 180,
  className = '',
  darkColor = '#0f172a',
  lightColor = '#ffffff',
  errorCorrectionLevel = 'M'
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: Math.max(size * 2, 256), // 2x for sharp retina scanning
      margin: 2,
      color: {
        dark: darkColor,
        light: lightColor
      },
      errorCorrectionLevel
    })
      .then(url => {
        setDataUrl(url);
        setError(false);
      })
      .catch(err => {
        console.error('Failed to generate QR code:', err);
        setError(true);
      });
  }, [value, size, darkColor, lightColor, errorCorrectionLevel]);

  if (error || !dataUrl) {
    return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: '#f1f5f9', 
          borderRadius: '12px', 
          fontSize: '11px', 
          color: '#64748b' 
        }}
        className={className}
      >
        Generating QR...
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="Scannable Official QR Code"
      width={size}
      height={size}
      className={className}
      style={{ 
        display: 'block', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' 
      }}
    />
  );
};

export default QrCodeView;
