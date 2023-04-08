//@flow

import React from 'react';
import { Wrapper, Block } from "./common";

export default {
  title: 'boundaryElement',
};

export const NoBoundary = () => (
  <Wrapper>
    <div className="container">
      <div className="column">
        <div className="scroll-area">
          <div className="reserved-space huge">space before block</div>
          <Block boundaryElement={null} />
          <div className="reserved-space huge">space after block</div>
        </div>
      </div>
    </div>
  </Wrapper>
);

export const NoBoundaryHeader = () => (
  <Wrapper>
    <div className="container">
      <div className="column">
        <div className="scroll-area">
          <div className="reserved-space huge">space before block</div>
          <Block boundaryElement={null} noFooter/>
          <div className="reserved-space huge">space after block</div>
        </div>
      </div>
    </div>
  </Wrapper>
);

export const NoBoundaryFooter = () => (
  <Wrapper>
    <div className="container">
      <div className="column">
        <div className="scroll-area">
          <div className="reserved-space huge">space before block</div>
          <Block boundaryElement={null} noHeader/>
          <div className="reserved-space huge">space after block</div>
        </div>
      </div>
    </div>
  </Wrapper>
);
