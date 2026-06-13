/// <reference types="vite/client" />

import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerElementProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string;
  "ios-src"?: string;
  poster?: string;
  "camera-controls"?: boolean;
  "camera-orbit"?: string;
  "field-of-view"?: string;
  "auto-rotate"?: boolean;
  "rotation-per-second"?: string;
  ar?: boolean;
  "shadow-intensity"?: string;
  exposure?: string;
  loading?: "lazy" | "eager";
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerElementProps;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerElementProps;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerElementProps;
    }
  }
}

export {};
