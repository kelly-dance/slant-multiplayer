import React from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const BoardFrame = ({ children }: { children: React.ReactChild }) => {

  return (
    
    <TransformWrapper
      initialScale={1}
      minScale={0.8}
      centerOnInit = {true}
      doubleClick = {{disabled: true}}
      panning={{activationKeys: [], velocityDisabled: false}}
      velocityAnimation={{
        animationType: "easeOutQuad", 
        animationTime: 100,
      }}
    >
      {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
        <React.Fragment>
          <div className="tools">
            <button onClick={() => zoomIn()} >+</button>
            <button onClick={() => zoomOut()}>-</button>
            <button onClick={() => resetTransform()}>x</button>
          </div>
          <div style={{backgroundColor:'lightgrey'}}>
            <TransformComponent wrapperStyle={{width:'100%'}}>
              {children}  
            </TransformComponent>
          </div>
        </React.Fragment>
      )}
    </TransformWrapper>
    
  )
}

export default BoardFrame;
