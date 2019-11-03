import React from 'react'
import { Typography } from '@material-ui/core'

const SynthBox = ({ chordName, handleSynthBoxClick }) => {
    return (
        <div
            id={chordName}
            onClick={() => handleSynthBoxClick(chordName)}
            className='synthBox'
        >
            <Typography>
                <h5>{chordName}</h5>
            </Typography>
        </div>
    )
}

export default SynthBox