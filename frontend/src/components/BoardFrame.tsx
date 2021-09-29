import React, { useState } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Board from './Board';

const BoardFrame = ({ children }: { children: React.ReactChild }) => {

  return (
    <TransformWrapper
      initialScale={1}
      centerOnInit = {true}
      doubleClick = {{disabled: true}}
    >
      {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
        <React.Fragment>
          <div className="tools">
            <button onClick={() => zoomIn()}>+</button>
            <button onClick={() => zoomOut()}>-</button>
            <button onClick={() => resetTransform()}>x</button>
          </div>
          <TransformComponent>
            {children}
          </TransformComponent>
        </React.Fragment>
      )}
    </TransformWrapper>

    /*<div id="boardFrame" className="container" style={frameStyle}>
      {children}
    </div>*/
  )
}

export default BoardFrame;
