import React from 'react'
import { Composition } from 'remotion'
import { BakasShowcase } from './Showcase'
import { BakasShowcasePortrait } from './ShowcasePortrait'
import { BakasBrandMark } from './scenes/shared'

const BakasLogoSquare: React.FC = () => (
  <div
    style={{
      width: 512,
      height: 512,
      backgroundColor: '#040406',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <BakasBrandMark size={360} withGlow={true} />
  </div>
)

export const MyComposition: React.FC = () => (
  <>
    <Composition
      id="BakasShowcase"
      component={BakasShowcase}
      durationInFrames={810}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="BakasShowcasePortrait"
      component={BakasShowcasePortrait}
      durationInFrames={810}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="BakasLogo"
      component={BakasLogoSquare}
      durationInFrames={30}
      fps={30}
      width={512}
      height={512}
    />
  </>
)
