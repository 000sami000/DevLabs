import React, { useState } from 'react';

import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'



const Whiteboard = () => {
  
  return (
    <>
   <br/>
   <br/>
  
    <div  style={{ position: 'fixed', inset: "4em 0 0 0" ,overflow:scrollY}}>
    <Tldraw />
  </div>
  </>
  );
};

export default Whiteboard;
