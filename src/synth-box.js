import React from 'react'

const SynthBox = ({ chordName, handleSynthBoxClick }) => {
    return (
        <div
            id={chordName}
            onClick={() => handleSynthBoxClick(chordName)}
            className='synthBox'
        >
            <h4>{chordName}</h4>
        </div>
    )
}

export default SynthBox