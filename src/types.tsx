import type { ReactNode } from "react";
import {CSSProperties} from "react";

type FuncRef = (el: HTMLElement | null) => void;

export type StickyMode = 'bottom' | 'top';

export interface CommonProps {
  /**
   * Sticky mode. `bottom` - stick to bottom, `top` - stick to top.
   * @default 'bottom'
   */
  mode: StickyMode,
  /**
   * Callback that is called when sticky state is changed.
   * @param isFixed - `true` if element is sticky.
   */
  onFixedToggle?: (isFixed: boolean) => void,
  /**
   * If `true` - element will be hidden when boundary reached.
   */
  hideOnBoundaryHit: boolean,
  /**
   * TODO: describe
   */
  offsetTransforms: boolean,
  /**
   * If `true` - element will not be sticky.
   */
  disabled: boolean,
  /**
   * Element that is used as boundary. Sticky element will stop being sticky when it reaches this element.
   * @default 'window'
   */
  boundaryElement: string,
  /**
   * Element that is used as scrollable container. Sticky element will be sticky inside this element.
   * @default 'window'
   */
  scrollElement: string | HTMLElement,
  /**
   * Offset from bottom of the screen (or top of the screen if mode is `top`) when sticky element should stop being sticky.
   * @default 0
   */
  bottomOffset: number,
  /**
   * Offset from top of the screen (or bottom of the screen if mode is `bottom`) when sticky element should stop being sticky.
   * @default 0
   */
  topOffset: number,
  /**
   * Interval in milliseconds when sticky element position should be rechecked.
   */
  positionRecheckInterval?: number,
  /**
   * If `true` - holder height will not be updated when sticky element is sticky.
   * @default false
   */
  dontUpdateHolderHeightWhenSticky: boolean,
  /**
   * If `true` - iOS fix will be enabled.
   * @see https://github.com/gm0t/react-sticky-el/issues/41
   * @default true
   */
  isIOSFixEnabled: boolean,
}

export type RenderFuncArgs = {
  holderRef: FuncRef,
  wrapperRef: FuncRef,
  isFixed: boolean,
  /**
   * Styles that should be applied to wrapper element.
   */
  wrapperStyles?: CSSProperties,
  /**
   * Styles that should be applied to holder element.
   */
  holderStyles?: CSSProperties,
}

export type RenderFunc = (args: RenderFuncArgs) => ReactNode;

export interface RenderProps extends CommonProps {
  children: RenderFunc
}