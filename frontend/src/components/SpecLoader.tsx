import React, { useState } from 'react';

import { BoardInterface } from '../BoardInterface';

const SpecLoader = ({ manager }: { manager: BoardInterface }) => {
  const [input, setInput] = useState('');

  return (
    <>
      <span>Input Spec: </span>
      <input type='text' value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={() => manager.setSpec(input)}>Load</button>
    </>
  )
}

export default SpecLoader;
