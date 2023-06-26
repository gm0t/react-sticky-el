import React, { useState } from 'react';
import { Wrapper, createBlocks } from "./common";

export default {
  title: 'hideOnBoundaryHit',
};

export const HideOnBoundaryHit1 = () => (
  <Wrapper>
    <div className="container">
      <div className="column">
        <div className="scroll-area">
          {createBlocks(false, 0, 0, true)}
        </div>
      </div>
    </div>
  </Wrapper>
);

HideOnBoundaryHit1.story = {
  name: 'no offset',
};

export const HideOnBoundaryHit2 = () => (
  <Wrapper>
    <div className="container">
      <div className="column">
        <div className="scroll-area">
          {createBlocks(false, 70, 70, true)}
        </div>
      </div>
    </div>
  </Wrapper>
);

HideOnBoundaryHit2.story = {
  name: 'with offset',
};

export const HideOnBoundaryHit3 = () => (
  <Wrapper>
    <div className="container">
      <div className="column">
        <div className="scroll-area">
          {createBlocks(false, 0, 0, false)}
        </div>
      </div>
    </div>
  </Wrapper>
);

HideOnBoundaryHit3.story = {
  name: 'false',
};

export const HideOnBoundaryHit4 = () => {
  const [ useClipPath, setUseClipPath ] = useState(false);

  return (
    <Wrapper>
      <div className="container">
        <div className="column">
          <div
            className="scroll-area scroll-area--distant"
            style={useClipPath ? { clipPath: 'inset(0 0 0 0)'} : undefined}
          >
            <p>
              If the <code>scrollareaElement</code> is not at the top of the
              viewport (shown here with 100px margin), when the sticky element
              overflows it, it will stay visible (try scrolling).
            </p>
            <p>
              You can use <code>clip-path: inset(0 0 0 0);</code> on the{' '}
              <code>scrollareaElement</code> to solve this but may have
              unintended consequences.
            </p>
            <p>
              <label>
                <input
                  type="checkbox"
                  checked={useClipPath}
                  onChange={() => setUseClipPath(!useClipPath)}
                />
                  Use clip path
                </label>
            </p>
            {createBlocks(false, 0, 0, false)}
          </div>
        </div>
      </div>
    </Wrapper>
)
};

HideOnBoundaryHit4.story = {
  name: 'overflow',
};

