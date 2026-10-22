/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TransformState {
  x: number; // offset in px relative to cutout center
  y: number; // offset in px relative to cutout center
  scale: number; // zoom factor (1.0 = fit)
  rotation: number; // 0, 90, 180, 270 degrees
  flipH: boolean;
}

export interface FrameConfig {
  imageUrl: string;
  width: number;
  height: number;
  circleCutout: {
    cx: number;
    cy: number;
    radius: number;
  };
  topTextPlacement: {
    y: number;
    color: string;
  };
  textPlacement: {
    y: number;
    color: string;
  };
}

export const OFFICIAL_FRAME: FrameConfig = {
  imageUrl: '/cadre-officiel.jpg',
  width: 736,
  height: 981,
  circleCutout: {
    cx: 368,
    cy: 485,
    radius: 216,
  },
  topTextPlacement: {
    y: 155,
    color: '#071E62',
  },
  textPlacement: {
    y: 815,
    color: '#FFFFFF',
  },
};
