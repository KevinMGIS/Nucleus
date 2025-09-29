'use client'

import { Box } from '@mui/joy'
import { keyframes } from '@mui/system'

// Animation keyframes
const nucleusOrbit = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

const nucleusPulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
`

const electronOrbit1 = keyframes`
  0% {
    transform: rotateZ(0deg) rotateY(75deg) rotateZ(0deg);
  }
  100% {
    transform: rotateZ(360deg) rotateY(75deg) rotateZ(-360deg);
  }
`

const electronOrbit2 = keyframes`
  0% {
    transform: rotateZ(120deg) rotateY(75deg) rotateZ(0deg);
  }
  100% {
    transform: rotateZ(480deg) rotateY(75deg) rotateZ(-360deg);
  }
`

const electronOrbit3 = keyframes`
  0% {
    transform: rotateZ(240deg) rotateY(75deg) rotateZ(0deg);
  }
  100% {
    transform: rotateZ(600deg) rotateY(75deg) rotateZ(-360deg);
  }
`

interface NucleusIconProps {
  size?: number
  speed?: 'slow' | 'normal' | 'fast'
}

export function NucleusIcon({ size = 32, speed = 'normal' }: NucleusIconProps) {
  const speedMultiplier = {
    slow: 4,
    normal: 2,
    fast: 1
  }[speed]

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1000px',
        mx: 1,
      }}
    >
      {/* Central nucleus */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: size * 0.25,
          height: size * 0.25,
          backgroundColor: 'primary.500',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          animation: `${nucleusPulse} ${2 * speedMultiplier}s ease-in-out infinite`,
          boxShadow: '0 0 8px rgba(251, 146, 60, 0.6)',
          zIndex: 2,
        }}
      />

      {/* Electron orbits */}
      {[electronOrbit1, electronOrbit2, electronOrbit3].map((orbit, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: size * 0.75,
            height: size * 0.75,
            transform: 'translate(-50%, -50%)',
            animation: `${orbit} ${3 * speedMultiplier}s linear infinite`,
            transformStyle: 'preserve-3d',
            zIndex: 1,
          }}
        >
          {/* Electron */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: '50%',
              width: size * 0.08,
              height: size * 0.08,
              backgroundColor: 'warning.500',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 4px rgba(251, 146, 60, 0.8)',
            }}
          />
          
          {/* Orbit ring */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              border: '1px solid',
              borderColor: 'primary.200',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.2,
            }}
          />
        </Box>
      ))}
    </Box>
  )
}

// Alternative simpler spinning icon
export function NucleusSpinner({ size = 32 }: { size?: number }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        mx: 1,
        animation: `${nucleusOrbit} 2s linear infinite`,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        {/* Central core - perfectly centered */}
        <circle
          cx="16"
          cy="16"
          r="3"
          fill="currentColor"
          style={{ color: 'var(--joy-palette-primary-500)' }}
        />
        
        {/* Orbital rings */}
        <circle
          cx="16"
          cy="16"
          r="11"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
          style={{ color: 'var(--joy-palette-primary-300)' }}
        />
        
        {/* Electrons positioned at exact angles */}
        <circle
          cx="27"
          cy="16"
          r="1.5"
          fill="currentColor"
          style={{ color: 'var(--joy-palette-warning-500)' }}
        />
        <circle
          cx="5"
          cy="16"
          r="1.5"
          fill="currentColor"
          style={{ color: 'var(--joy-palette-warning-500)' }}
        />
        <circle
          cx="16"
          cy="5"
          r="1.5"
          fill="currentColor"
          style={{ color: 'var(--joy-palette-warning-500)' }}
        />
      </svg>
    </Box>
  )
}