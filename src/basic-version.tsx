import React, {CSSProperties, ReactNode} from 'react';
import type {CommonProps} from './types'
import StickyRenderProp from './render-props-version';

export interface Props extends CommonProps {
  /**
   * Class name to be applied to the sticky element when it is fixed.
   * @default {}
   */
  stickyStyle: CSSProperties,
  /**
   * Class name to be applied to the sticky element when it is fixed.
   * @default 'sticky'
   */
  stickyClassName: string,
  /**
   * Class name to be applied to the wrapper element.
   * @default ''
   */
  wrapperClassName: string,
  children?: ReactNode,
}

export const defaultProps = {
  ...StickyRenderProp.defaultProps,
  stickyClassName: 'sticky',
  wrapperClassName: '',
  stickyStyle: {},
};
function Sticky(props: Partial<Props>) {
  const {
    // props for StickyRenderProp
    mode,
    onFixedToggle,
    hideOnBoundaryHit,
    offsetTransforms,
    disabled,
    boundaryElement,
    scrollElement,
    bottomOffset,
    topOffset,
    positionRecheckInterval,
    children,
    isIOSFixEnabled,
    dontUpdateHolderHeightWhenSticky,

    // own props
    wrapperClassName,
    stickyClassName,
    stickyStyle,

    // rest of the props that we will forward to wrapper
    ...rest
  } = {
    ...defaultProps,
    ...props
  };

  return <StickyRenderProp
    mode={mode}
    onFixedToggle={onFixedToggle}
    hideOnBoundaryHit={hideOnBoundaryHit}
    offsetTransforms={offsetTransforms}
    disabled={disabled}
    boundaryElement={boundaryElement}
    scrollElement={scrollElement}
    bottomOffset={bottomOffset}
    topOffset={topOffset}
    positionRecheckInterval={positionRecheckInterval}
    isIOSFixEnabled={isIOSFixEnabled}
    dontUpdateHolderHeightWhenSticky={dontUpdateHolderHeightWhenSticky}
  >
    {({isFixed, wrapperStyles, wrapperRef, holderStyles, holderRef}) => (
      <div {...rest} ref={holderRef} style={holderStyles}>
        <div
          {...rest}
          className={`${wrapperClassName} ${isFixed ? stickyClassName : ''}`}
          style={
            isFixed ? {...wrapperStyles, ...stickyStyle} : wrapperStyles
          }
          ref={wrapperRef}
        >
          {children}
        </div>
      </div>
    )}
  </StickyRenderProp>
}

export default Sticky;