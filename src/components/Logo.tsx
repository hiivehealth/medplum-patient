// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'react';
import HiiveHealthLogo from '../img/hiive-health-logo.svg';

export interface LogoProps {
  readonly width: number;
}

export function Logo(props: LogoProps): JSX.Element {
  const width = props.width;

  return <img src={HiiveHealthLogo} alt="Hiive Health" style={{ display: 'block', width, height: 'auto' }} />;
}
