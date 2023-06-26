// @flow

import React, {ReactNode} from "react";
import Sticky from "../src";
import {Props} from "../src/basic-version";

import './examples.scss';
import {action} from '@storybook/addon-actions';

interface BlockProps extends Props {
  noHeader: boolean,
  noFooter: boolean,
}

export const Block = ({noHeader, noFooter, ...rest}: BlockProps) => {
  return (
    <div className="block">
      {
        noHeader ? null : (
          <Sticky {...rest}
                  onFixedToggle={action('onFixedToggle')}>
            <h2 className="header">Header</h2>
          </Sticky>
        )
      }
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum sodales ullamcorper vehicula. Duis placerat
        quam porta lorem lobortis, sit amet sodales mauris finibus. Donec posuere diam at volutpat viverra. Cras
        fringilla auctor augue sed congue. Maecenas mollis quis enim quis egestas. In sollicitudin mi a pretium varius.
        Integer eleifend sodales pharetra. Nullam vitae libero sem. Nulla et eros congue, tincidunt ante eu, tincidunt
        eros. Donec nisl purus, convallis a hendrerit ut, eleifend in lectus. Proin luctus dignissim lacus, in laoreet
        arcu eleifend non. Quisque viverra ipsum a massa porta convallis. Donec tincidunt imperdiet purus, interdum
        elementum ante commodo a. Quisque pharetra arcu sapien, vel ornare magna sollicitudin quis.
      </p>
      <p>
        Nunc congue magna eget eros blandit, eu viverra magna semper. Nullam in diam a metus dictum consequat. Quisque
        ultricies, ipsum non euismod semper, velit felis lacinia nibh, et finibus quam leo vitae nisi. Maecenas interdum
        diam quis risus bibendum, eu fermentum est pharetra. In dictum at enim pretium bibendum. Praesent efficitur
        iaculis dolor in sodales. Morbi maximus in ipsum in malesuada. Proin semper lacus tempor magna aliquam, sed
        aliquam dui scelerisque. Donec nisi nulla, rhoncus a tristique eget, ultrices vitae dolor. Ut id urna vitae ante
        tincidunt pharetra at non metus. Nunc in suscipit nulla. Sed vitae leo vulputate, euismod tortor vel, aliquet
        velit. Curabitur eget tincidunt elit. Nam et ligula finibus, eleifend velit et, commodo quam. Praesent non
        libero velit.
      </p>
      {
        noFooter ? null : (
          <Sticky
            {...rest}
            mode="bottom"
            onFixedToggle={action('onFixedToggle')}>
            <h2 className="footer">Footer</h2>
          </Sticky>
        )
      }
    </div>
  );
};

Block.defaultProps = {
  ...Sticky.defaultProps,
  mode: 'top',
  topOffset: 0,
  bottomOffset: 0,
  isIOSFixEnabled: true,
  offsetTransforms: true,
  disabled: false,
  onFixedToggle: null,
  noHeader: false,
  noFooter: false,
  dontUpdateHolderHeightWhenSticky: true,
  positionRecheckInterval: 100,
  boundaryElement: ".block",
  scrollElement: ".scroll-area"
};

export const createBlocks = (disabled: boolean, topOffset: number, bottomOffset: number, hideOnBoundaryHit = true) => {
  const blocks = [];
  for (let i = 0; i < 3; i += 1) {
    blocks.push(
      <Block
        key={i}
        disabled={disabled}
        topOffset={topOffset}
        bottomOffset={bottomOffset}
        hideOnBoundaryHit={hideOnBoundaryHit}
       />,
      <div key={`space-${i}`} className="reserved-space">--/--</div>
    )
  }
  // remove the last item
  blocks.pop();
  return blocks;
};

export const Wrapper = ({children}: { children?: ReactNode }) => (
  <div className="page">
    {children}
  </div>
);