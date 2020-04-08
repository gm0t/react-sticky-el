// @flow

import React, { type Node } from 'react';
import type { CommonProps, MaybeStyles } from './types'
import StickyRenderProp from './render-props-version';


type Props = {
  ...CommonProps,
  stickyStyle: MaybeStyles,
  stickyClassName: string,
  children: Node,
  wrapperClassName: string,
  holderProps: any,
  ...
}

function Sticky(props: Props) {
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
    noExceptionOnMissedScrollElement,
    children,
    isIOSFixEnabled,

    // own props
    wrapperClassName,
    stickyClassName,
    stickyStyle,

    // rest of the props that we will forward to wrapper
    ...rest
  } = props;

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
    noExceptionOnMissedScrollElement={noExceptionOnMissedScrollElement}
    isIOSFixEnabled={isIOSFixEnabled}
  >
    {({ isFixed, wrapperStyles, wrapperRef, holderStyles, holderRef }) => (
      <div {...rest} ref={holderRef} style={holderStyles}>
        <div
          {...rest}
          className={`${wrapperClassName} ${isFixed ? stickyClassName : ''}`}
          style={
            // $FlowFixMe - flow does not like when we merge 2 inexact objects
            isFixed ? { ...wrapperStyles, ...stickyStyle } : wrapperStyles
          }
          ref={wrapperRef}
        >
          {children}
        </div>
      </div>
    )}
  </StickyRenderProp>
}

Sticky.defaultProps = {
  stickyClassName: 'sticky',
  wrapperClassName: '',
  stickyStyle: {}
};

export default Sticky;