import React from 'react';
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

