// @flow strict

import type { Node } from "react";

type FuncRef = (el: HTMLElement | null) => void;

export type CommonProps = {
  mode: 'bottom' | 'top',
  onFixedToggle: (boolean) => void,
  hideOnBoundaryHit: boolean,
  offsetTransforms: boolean,
  disabled: boolean,
  boundaryElement: string,
  scrollElement: string | HTMLElement,
  bottomOffset: number,
  topOffset: number,
  positionRecheckInterval: number,
  noExceptionOnMissedScrollElement: boolean,
  isIOSFixEnabled: boolean,
}

export type MaybeStyles = { [string]: string } | null;

export type RenderFuncArgs = {
  holderRef: FuncRef,
  wrapperRef: FuncRef,
  isFixed: boolean,
  wrapperStyles: MaybeStyles,
  holderStyles: MaybeStyles,
}

export type RenderFunc = RenderFuncArgs => Node;

export type RenderProps = {
  ...CommonProps,
  children: RenderFunc
}