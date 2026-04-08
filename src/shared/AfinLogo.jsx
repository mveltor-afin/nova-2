import React from 'react';
import afinLogoSrc from '../assets/afin-logo.png';

const AfinLogo = ({ size = 48 }) => (
  <img src={afinLogoSrc} alt="Afin Bank" width={size} height={size} style={{ objectFit:"contain" }} />
);

export default AfinLogo;
