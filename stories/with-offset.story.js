import React from 'react';
import { linkTo } from '@storybook/addon-links';
import { Welcome } from '@storybook/react/demo';
import { createBlocks, Wrapper } from "./common";

export default {
  title: 'Offsets',
};

export const TopOffset = () => (
  <Wrapper>
    <div className="container">
      <div className="column">
        <div className="scroll-area">
          {createBlocks(false, 70, 0, false)}
        </div>
      </div>
    </div>
  </Wrapper>
);

TopOffset.story = {
  name: 'top offset',
};

export const BottomOffset = () => (
  <Wrapper>
    <div className="container">
      <div className="column">
        <div className="scroll-area">
          {createBlocks(false, 0, 70, false)}
        </div>
      </div>
    </div>
  </Wrapper>
);

BottomOffset.story = {
  name: 'bottom',
};

export const BottomAndTopOffset = () => (
  <Wrapper>
    <div className="container">
      <div className="column">
        <div className="scroll-area">
          {createBlocks(false, 70, 70, false)}
        </div>
      </div>
    </div>
  </Wrapper>
);

BottomAndTopOffset.story = {
  name: 'both',
};
