import React from 'react'

const SynthBox = ({ chordName, handleSynthBoxClick }) => {
  return (
    <div id={chordName} onClick={() => handleSynthBoxClick(chordName)} className="synthBox">
      <h5>{chordName}</h5>
    </div>
  )
}

export default SynthBox
