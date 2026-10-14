// Encodes channels of float samples (-1..1) as a 16-bit PCM WAV file
export function encodeWav(channels, sampleRate) {
  const channelCount = channels.length
  const frames = channels[0].length
  const bytesPerSample = 2
  const dataSize = frames * channelCount * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  const writeText = (offset, text) => {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i))
    }
  }

  writeText(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeText(8, 'WAVE')
  writeText(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channelCount, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * channelCount * bytesPerSample, true)
  view.setUint16(32, channelCount * bytesPerSample, true)
  view.setUint16(34, 16, true)
  writeText(36, 'data')
  view.setUint32(40, dataSize, true)

  let offset = 44
  for (let frame = 0; frame < frames; frame++) {
    for (let channel = 0; channel < channelCount; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][frame]))
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true
      )
      offset += bytesPerSample
    }
  }
  return buffer
}
