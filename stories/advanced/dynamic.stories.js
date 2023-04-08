// @flow
import React, { useState } from 'react';
import { Wrapper } from "../common";
import Sticky from "../../src";

export default {
  title: 'Advanced',
};

export const DontUpdateHolderHeightWhenSticky = () => {
  const [ dontUpdateHolderHeightWhenSticky, setDontUpdateFlag ] = useState<boolean>(true);

  return (
    <Wrapper>
      <div className="container">
        <div className="column">
          <div className="scroll-area">
            <div className="reserved-space">
              <p>
                If your sticky element changes its size when it becomes sticky, you may use this property to prevent
                content from jumping.
              </p>
              <p>
                When the checkbox below is disabled and title becomes sticky, you can notice how content that goes after
                it jumps to the top. It happens because 'minHeight' of the holder element is being updated
                <br/>{dontUpdateHolderHeightWhenSticky ? "enab" : "disab"}
              </p>
              <label>
                <input type="checkbox" checked={dontUpdateHolderHeightWhenSticky}
                       onChange={() => setDontUpdateFlag(!dontUpdateHolderHeightWhenSticky)} /> &nbsp;
                dontUpdateHolderHeightWhenSticky
              </label>
            </div>

            <div className="block">
              <Sticky boundaryElement=".block" scrollElement=".scroll-area"
                      dontUpdateHolderHeightWhenSticky={dontUpdateHolderHeightWhenSticky}
                      topOffset={90}>
                <div className="header">
                  <h2>Main title of page</h2>
                  <h3>Subtitle that will be hidden when sticky</h3>
                </div>
              </Sticky>
              <h3 id="content-section-1">Content section 1</h3>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Vestibulum sodales ullamcorper vehicula. Duis placerat quam
                porta lorem lobortis, sit amet sodales mauris finibus. Donec
                posuere diam at volutpat viverra. Cras fringilla auctor augue
                sed congue. Maecenas mollis quis enim quis egestas. In
                sollicitudin mi a pretium varius. Integer eleifend sodales
                pharetra. Nullam vitae libero sem. Nulla et eros congue,
                tincidunt ante eu, tincidunt eros. Donec nisl purus, convallis a
                hendrerit ut, eleifend in lectus. Proin luctus dignissim lacus,
                in laoreet arcu eleifend non. Quisque viverra ipsum a massa
                porta convallis. Donec tincidunt imperdiet purus, interdum
                elementum ante commodo a. Quisque pharetra arcu sapien, vel
                ornare magna sollicitudin quis.
              </p>
              <h3 id="content-section-2">Content section 2</h3>
              <p>
                Nunc congue magna eget eros blandit, eu viverra magna semper.
                Nullam in diam a metus dictum consequat. Quisque ultricies,
                ipsum non euismod semper, velit felis lacinia nibh, et finibus
                quam leo vitae nisi. Maecenas interdum diam quis risus bibendum,
                eu fermentum est pharetra. In dictum at enim pretium bibendum.
                Praesent efficitur iaculis dolor in sodales. Morbi maximus in
                ipsum in malesuada. Proin semper lacus tempor magna aliquam, sed
                aliquam dui scelerisque. Donec nisi nulla, rhoncus a tristique
                eget, ultrices vitae dolor. Ut id urna vitae ante tincidunt
                pharetra at non metus. Nunc in suscipit nulla. Sed vitae leo
                vulputate, euismod tortor vel, aliquet velit. Curabitur eget
                tincidunt elit. Nam et ligula finibus, eleifend velit et,
                commodo quam. Praesent non libero velit.
              </p>
              <h3 id="content-section-3">Content section 3</h3>
              <p>
                Nunc congue magna eget eros blandit, eu viverra magna semper.
                Nullam in diam a metus dictum consequat. Quisque ultricies,
                ipsum non euismod semper, velit felis lacinia nibh, et finibus
                quam leo vitae nisi. Maecenas interdum diam quis risus bibendum,
                eu fermentum est pharetra. In dictum at enim pretium bibendum.
                Praesent efficitur iaculis dolor in sodales. Morbi maximus in
                ipsum in malesuada. Proin semper lacus tempor magna aliquam, sed
                aliquam dui scelerisque. Donec nisi nulla, rhoncus a tristique
                eget, ultrices vitae dolor. Ut id urna vitae ante tincidunt
                pharetra at non metus. Nunc in suscipit nulla. Sed vitae leo
                vulputate, euismod tortor vel, aliquet velit. Curabitur eget
                tincidunt elit. Nam et ligula finibus, eleifend velit et,
                commodo quam. Praesent non libero velit.
              </p>
              <Sticky
                mode="bottom"
                boundaryElement=".block"
                scrollElement=".scroll-area"
                dontUpdateHolderHeightWhenSticky
              >
                <h2 className="footer">Footer</h2>
              </Sticky>
            </div>

            <div className="reserved-space">space after block</div>
          </div>
        </div>
      </div>
    </Wrapper>
  )
};
