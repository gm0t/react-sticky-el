// @flow

import React, { type Node } from 'react';
import type { CommonProps, MaybeStyles } from './types'
import StickyRenderProp from './render-props-version';


type Props = {
  ...CommonProps,
  stickyStyles: MaybeStyles,
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

    // own props
    wrapperClassName,
    stickyClassName,
    stickyStyles,

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
  >
    {({ isFixed, wrapperStyles, wrapperRef, holderStyles, holderRef }) => (
      <div {...rest} ref={holderRef} style={holderStyles}>
        <div
          {...rest}
          className={`${wrapperClassName} ${isFixed ? stickyClassName : ''}`}
          style={
            // $FlowFixMe - flow does not like when we merge 2 inexact objects
            isFixed ? { ...wrapperStyles, ...stickyStyles } : wrapperStyles
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
  stickyStyles: {}
};

export default Sticky;