import Tone from 'tone'
let synth

export const majorScaleChords = {}

export function buildChords(synthTexture) {
    synth = new Tone.PolySynth(4, Tone[synthTexture]).toMaster()

    class chordObj {
        constructor() {
            this.notes = [...arguments]
        }
        start() {
            synth.triggerAttack(this.notes)
        }
        stop() {
            synth.releaseAll()
        }
    }

    const CMajor = new chordObj('C3', 'E3', 'G3')
    const AMinor = new chordObj('A2', 'C3', 'E3') //
    const FMajor = new chordObj('F3', 'A3', 'C4') //
    const GMajor = new chordObj('G3', 'B3', 'D4') //
    const DMinor = new chordObj('D3', 'F3', 'A3')
    const EMinor = new chordObj('E3', 'G3', 'B3')
    const bDim = new chordObj('B3', 'D4', 'F4')
    const CMajorMaj7 = new chordObj('C3', 'E3', 'G3', 'B3')
    const CMajorMaj9 = new chordObj('C3', 'E3', 'G3', 'B3', 'D4')
    const AMinor7 = new chordObj('A2', 'C3', 'E3', 'G3') //
    const FMajorMaj7 = new chordObj('F3', 'A3', 'C4', 'E4') //
    const FMajorMaj9 = new chordObj('F3', 'A3', 'C4', 'E4', 'G4') //
    const GMajor7 = new chordObj('G3', 'B3', 'D4', 'F4') //
    const DMinor7 = new chordObj('D3', 'F3', 'A3', 'C4')
    const DMinor9 = new chordObj('D3', 'F3', 'A3', 'C4', 'E4')
    const EMinor7 = new chordObj('E3', 'G3', 'B3', 'D4')
    const EMinor9 = new chordObj('E3', 'G3', 'B3', 'D4', 'Gb4')
    const CMajorAdd9 = new chordObj('C3', 'E3', 'G3', 'D4')
    const GMajorAdd9 = new chordObj('G3', 'B3', 'D4', 'A4') //
    const FMajorAdd9 = new chordObj('F3', 'A3', 'C4', 'G4') //
    const AMinor9 = new chordObj('A2', 'C3', 'E3', 'G3', 'B3') //
    const C5 = new chordObj('C3', 'G3')
    const D5 = new chordObj('D3', 'A3')
    const E5 = new chordObj('E3', 'B3')
    const F5 = new chordObj('F3', 'C4') //
    const G5 = new chordObj('G3', 'D4') //
    const A5 = new chordObj('A3', 'E4')
    const CMajor6 = new chordObj('C3', 'E3', 'G3', 'A3')
    const FMajor6 = new chordObj('F3', 'A3', 'C4', 'D4') //
    const GMajor6 = new chordObj('G3', 'B3', 'D4', 'E4') //
    const GMajor9 = new chordObj('G3', 'B3', 'D4', 'F4', 'A4') //
    const DMinorAdd9 = new chordObj('D3', 'F3', 'A3', 'E4')
    const AMinorAdd9 = new chordObj('A3', 'C4', 'E4', 'B4')
    const DbMajor = new chordObj('Db3', 'F3', 'Ab3')
    const DbMajorMaj7 = new chordObj('Db3', 'F3', 'Ab3', 'C4')
    const DbMajorMaj9 = new chordObj('Db3', 'F3', 'Ab3', 'C4', 'Eb4')
    const DbMajorAdd9 = new chordObj('Db3', 'F3', 'Ab3', 'Eb4')
    const DbMajor6 = new chordObj('Db3', 'F3', 'Ab3', 'Bb3')
    const EbMinor = new chordObj('Eb3', 'Gb3', 'Bb3')
    const EbMinor7 = new chordObj('Eb3', 'Gb3', 'Bb3', 'Db4')
    const EbMinor9 = new chordObj('Eb3', 'Gb3', 'Bb3', 'Db4', 'F4')
    const EbMinorAdd9 = new chordObj('Eb3', 'Gb3', 'Bb3', 'F4')
    const FMinor = new chordObj('F3', 'Ab3', 'C4')
    const FMinor7 = new chordObj('F3', 'Ab3', 'C4', 'Eb4')
    const FMinor9 = new chordObj('F3', 'Ab3', 'C4', 'Eb4', 'G4')
    const GbMajor = new chordObj('Gb3', 'Bb3', 'Db4')
    const GbMajorMaj7 = new chordObj('Gb3', 'Bb3', 'Db4', 'F4')
    const GbMajorMaj9 = new chordObj('Gb3', 'Bb3', 'Db4', 'F4', 'Ab4')
    const GbMajorAdd9 = new chordObj('Gb3', 'Bb3', 'Db4', 'Ab4')
    const GbMajor6 = new chordObj('Gb3', 'Bb3', 'Db4', 'Eb4')
    const AbMajor = new chordObj('Ab3', 'C4', 'Eb4')
    const AbMajor7 = new chordObj('Ab3', 'C4', 'Eb4', 'Gb4')
    const AbMajorAdd9 = new chordObj('Ab3', 'C4', 'Eb4', 'Bb4')
    const AbMajor6 = new chordObj('Ab3', 'C4', 'Eb4', 'F4')
    const AbMajor9 = new chordObj('Ab3', 'C4', 'Eb4', 'Gb4', 'Bb4')
    const BbMinor = new chordObj('Bb3', 'Db4', 'F4')
    const BbMinor7 = new chordObj('Bb3', 'Db4', 'F4', 'Ab4')
    const BbMinor9 = new chordObj('Bb3', 'Db4', 'F4', 'Ab4', 'C5')
    const BbMinorAdd9 = new chordObj('Bb3', 'Db4', 'F4', 'C5')
    const cdim = new chordObj('C4', 'Eb4', 'Gb4')
    const Db5 = new chordObj('Db3', 'Ab3')
    const Eb5 = new chordObj('Eb3', 'Bb3')
    const Gb5 = new chordObj('Gb3', 'Db4')
    const Ab5 = new chordObj('Ab3', 'Eb4')
    const Bb5 = new chordObj('Bb3', 'F4')
    const DMajor = new chordObj('D3', 'Gb3', 'A3')
    const DMajorMaj7 = new chordObj('D3', 'Gb3', 'A3', 'Db4')
    const DMajorMaj9 = new chordObj('D3', 'Gb3', 'A3', 'Db4', 'E4')
    const DMajorAdd9 = new chordObj('D3', 'Gb3', 'A3', 'E4')
    const DMajor6 = new chordObj('D3', 'Gb3', 'A3', 'B3')
    const EMinorAdd9 = new chordObj('E3', 'G3', 'B3', 'Gb4')
    const GbMinor = new chordObj('Gb3', 'A3', 'Db4')
    const GbMinor7 = new chordObj('Gb3', 'A3', 'Db4', 'E4')
    const GbMinor9 = new chordObj('Gb3', 'A3', 'Db4', 'E4', 'Ab4')
    const GMajorMaj7 = new chordObj('G3', 'B3', 'D4', 'Gb4')
    const GMajorMaj9 = new chordObj('G3', 'B3', 'D4', 'Gb4', 'A4')
    const AMajor = new chordObj('A3', 'Db4', 'E4')
    const AMajor7 = new chordObj('A3', 'Db4', 'E4', 'Gb4')
    const AMajorAdd9 = new chordObj('A3', 'Db4', 'E4', 'B4')
    const AMajor6 = new chordObj('A3', 'Db4', 'E4', 'B4')
    const AMajor9 = new chordObj('A3', 'Db4', 'E4', 'G4', 'B4')
    const BMinor = new chordObj('B3', 'D4', 'Gb4')
    const BMinor7 = new chordObj('B3', 'D4', 'Gb4', 'A4')
    const BMinor9 = new chordObj('B3', 'D4', 'Gb4', 'A4', 'Db5')
    const BMinorAdd9 = new chordObj('B3', 'D4', 'Gb4', 'Db5')
    const dddim = new chordObj('Db4', 'E4', 'G4')
    const B5 = new chordObj('B3', 'Gb4')
    const EbMajor = new chordObj('Eb3', 'G3', 'Bb3')
    const EbMajorMaj7 = new chordObj('Eb3', 'G3', 'Bb3', 'D4')
    const EbMajorMaj9 = new chordObj('Eb3', 'G3', 'Bb3', 'D4', 'F4')
    const EbMajorAdd9 = new chordObj('Eb3', 'G3', 'Bb3', 'F4')
    const EbMajor6 = new chordObj('Eb3', 'G3', 'Bb3', 'C4')
    const FMinorAdd9 = new chordObj('F3', 'Ab3', 'C4', 'G4')
    const GMinor = new chordObj('G3', 'Bb3', 'D4')
    const GMinor7 = new chordObj('G3', 'Bb3', 'D4', 'F4')
    const GMinor9 = new chordObj('G3', 'Bb3', 'D4', 'F4', 'A4')
    const GMinorAdd9 = new chordObj('G3', 'Bb3', 'D4', 'A4')
    const AbMajorMaj7 = new chordObj('Ab3', 'C4', 'Eb4', 'G4')
    const AbMajorMaj9 = new chordObj('Ab3', 'C4', 'Eb4', 'G4', 'Bb4')
    const BbMajor = new chordObj('Bb3', 'D4', 'F4')
    const BbMajor7 = new chordObj('Bb3', 'D4', 'F4', 'Ab4')
    const BbMajor9 = new chordObj('Bb3', 'D4', 'F4', 'Ab4', 'C5')
    const BbMajor6 = new chordObj('Bb3', 'D4', 'F4', 'G4')
    const BbMajorAdd9 = new chordObj('Bb3', 'D4', 'F4', 'C5')
    const CMinor = new chordObj('C4', 'Eb4', 'G4')
    const CMinor7 = new chordObj('C4', 'Eb4', 'G4', 'Bb4')
    const CMinor9 = new chordObj('C4', 'Eb4', 'G4', 'Bb4', 'D5')
    const CMinorAdd9 = new chordObj('C4', 'Eb4', 'G4', 'D5')
    const dDim = new chordObj('D4', 'F4', 'Ab4')
    const EMajor = new chordObj('E3', 'Ab3', 'B3')
    const EMajorMaj7 = new chordObj('E3', 'Ab3', 'B3', 'Eb4')
    const EMajorMaj9 = new chordObj('E3', 'Ab3', 'B3', 'Eb4', 'Gb4')
    const EMajorAdd9 = new chordObj('E3', 'Ab3', 'B3', 'Gb4')
    const EMajor6 = new chordObj('E3', 'Ab3', 'B3', 'Db4')
    const GbMinorAdd9 = new chordObj('Gb3', 'A3', 'Db4', 'Ab4')
    const AbMinor = new chordObj('Ab3', 'B3', 'Eb4')
    const AbMinor7 = new chordObj('Ab3', 'B3', 'Eb4', 'Gb3')
    const AbMinor9 = new chordObj('Ab3', 'B3', 'Eb4', 'Gb3', 'Bb3')
    const AMajorMaj7 = new chordObj('A3', 'Db4', 'E4', 'Ab4')
    const AMajorMaj9 = new chordObj('A3', 'Db4', 'E4', 'Ab4', 'B4')
    const BMajor = new chordObj('B3', 'Eb4', 'Gb4')
    const BMajor7 = new chordObj('B3', 'Eb4', 'Gb4', 'A4')
    const BMajorAdd9 = new chordObj('B3', 'Eb4', 'Gb4', 'Db5')
    const BMajor6 = new chordObj('B3', 'Eb4', 'Gb4', 'Ab4')
    const BMajor9 = new chordObj('B3', 'Eb4', 'Gb4', 'A4', 'Db5')
    const DbMinor = new chordObj('Db4', 'E4', 'Ab4')
    const DbMinor7 = new chordObj('Db4', 'E4', 'Ab4', 'B4')
    const DbMinor9 = new chordObj('Db4', 'E4', 'Ab4', 'B4', 'Eb5')
    const DbMinorAdd9 = new chordObj('Db4', 'E4', 'Ab4', 'Eb5')
    const ebdim = new chordObj('Eb4', 'Gb4', 'A4')
    const BbMajorMaj7 = new chordObj('Bb3', 'D4', 'F4', 'A4')
    const BbMajorMaj9 = new chordObj('Bb3', 'D4', 'F4', 'A4', 'C5')
    const CMajor7 = new chordObj('C4', 'E4', 'G4', 'Bb4')
    const CMajor9 = new chordObj('C4', 'E4', 'G4', 'Bb4', 'D5')
    const eDim = new chordObj('E4', 'G4', 'Bb4')
    const AbMinorAdd9 = new chordObj('Ab3', 'B3', 'Eb4', 'Bb4')
    const BMajorMaj7 = new chordObj('B3', 'Eb4', 'Gb4', 'Bb4')
    const BMajorMaj9 = new chordObj('B3', 'Eb4', 'Gb4', 'Bb4', 'Db5')
    const DbMajor7 = new chordObj('Db4', 'F4', 'Ab4', 'B4')
    const DbMajor9 = new chordObj('Db4', 'F4', 'Ab4', 'B4', 'Eb5')
    const fDim = new chordObj('F4', 'Ab4', 'B4')
    const DMajor7 = new chordObj('D4', 'Gb4', 'A4', 'C5')
    const DMajor9 = new chordObj('D4', 'Gb4', 'A4', 'C5', 'E5')
    const gbDim = new chordObj('Gb4', 'A4', 'C5')
    const EbMajor7 = new chordObj('Eb4', 'G4', 'Bb4', 'Db5')
    const EbMajor9 = new chordObj('Eb4', 'G4', 'Bb4', 'Db5', 'F5')
    const gDim = new chordObj('G4', 'Bb4', 'Db5')
    const EMajor7 = new chordObj('E4', 'Ab4', 'B4', 'D5')
    const EMajor9 = new chordObj('E4', 'Ab4', 'B4', 'D5', 'Gb5')
    const abDim = new chordObj('Ab4', 'B4', 'D5')
    const FMajor7 = new chordObj('F4', 'A4', 'C5', 'Eb5')
    const FMajor9 = new chordObj('F4', 'A4', 'C5', 'Eb5', 'G5')
    const aDim = new chordObj('A4', 'C5', 'Eb5')
    const GbMajor7 = new chordObj('Gb3', 'Bb3', 'Db4', 'E4')
    const GbMajor9 = new chordObj('Gb3', 'Bb3', 'Db4', 'E4', 'Ab4')
    const bbDim = new chordObj('Bb3', 'Db3', 'E4')

    majorScaleChords.C = {}

    majorScaleChords.C.C = CMajor
    majorScaleChords.C.CMaj7 = CMajorMaj7
    majorScaleChords.C.CMaj9 = CMajorMaj9
    majorScaleChords.C.Cadd9 = CMajorAdd9
    majorScaleChords.C.C6 = CMajor6
    majorScaleChords.C.Dm = DMinor
    majorScaleChords.C.Dm7 = DMinor7
    majorScaleChords.C.Dm9 = DMinor9
    majorScaleChords.C.Dmadd9 = DMinorAdd9
    majorScaleChords.C.Em = EMinor
    majorScaleChords.C.Em7 = EMinor7
    majorScaleChords.C.F = FMajor
    majorScaleChords.C.FMaj7 = FMajorMaj7
    majorScaleChords.C.FMaj9 = FMajorMaj9
    majorScaleChords.C.Fadd9 = FMajorAdd9
    majorScaleChords.C.F6 = FMajor6
    majorScaleChords.C.G = GMajor
    majorScaleChords.C.G7 = GMajor7
    majorScaleChords.C.Gadd9 = GMajorAdd9
    majorScaleChords.C.G6 = GMajor6
    majorScaleChords.C.G9 = GMajor9
    majorScaleChords.C.Am = AMinor
    majorScaleChords.C.Am7 = AMinor7
    majorScaleChords.C.Am9 = AMinor9
    majorScaleChords.C.Amadd9 = AMinorAdd9
    majorScaleChords.C.Bdim = bDim
    majorScaleChords.C.C5 = C5
    majorScaleChords.C.D5 = D5
    majorScaleChords.C.E5 = E5
    majorScaleChords.C.F5 = F5
    majorScaleChords.C.G5 = G5
    majorScaleChords.C.A5 = A5

    majorScaleChords.Db = {}

    majorScaleChords.Db.Db = DbMajor
    majorScaleChords.Db.DbMajor7 = DbMajorMaj7
    majorScaleChords.Db.DbMajor9 = DbMajorMaj9
    majorScaleChords.Db.Dbadd9 = DbMajorAdd9
    majorScaleChords.Db.Db6 = DbMajor6
    majorScaleChords.Db.Ebm = EbMinor
    majorScaleChords.Db.Ebm7 = EbMinor7
    majorScaleChords.Db.Ebm9 = EbMinor9
    majorScaleChords.Db.Ebmadd9 = EbMinorAdd9
    majorScaleChords.Db.Fm = FMinor
    majorScaleChords.Db.Fm7 = FMinor7
    majorScaleChords.Db.Gb = GbMajor
    majorScaleChords.Db.GbMaj7 = GbMajorMaj7
    majorScaleChords.Db.GbMaj9 = GbMajorMaj9
    majorScaleChords.Db.Gbadd9 = GbMajorAdd9
    majorScaleChords.Db.Gb6 = GbMajor6
    majorScaleChords.Db.Ab = AbMajor
    majorScaleChords.Db.Ab7 = AbMajor7
    majorScaleChords.Db.Abadd9 = AbMajorAdd9
    majorScaleChords.Db.Ab6 = AbMajor6
    majorScaleChords.Db.Ab9 = AbMajor9
    majorScaleChords.Db.Bbm = BbMinor
    majorScaleChords.Db.Bbm7 = BbMinor7
    majorScaleChords.Db.Bbm9 = BbMinor9
    majorScaleChords.Db.Bbmadd9 = BbMinorAdd9
    majorScaleChords.Db.Cdim = cdim
    majorScaleChords.Db.Db5 = Db5
    majorScaleChords.Db.Eb5 = Eb5
    majorScaleChords.Db.Gb5 = Gb5
    majorScaleChords.Db.Ab5 = Ab5
    majorScaleChords.Db.Bb5 = Bb5
    majorScaleChords.Db.F5 = F5

    majorScaleChords.D = {}

    majorScaleChords.D.D = DMajor
    majorScaleChords.D.DMajor7 = DMajorMaj7
    majorScaleChords.D.DMajor9 = DMajorMaj9
    majorScaleChords.D.Dadd9 = DMajorAdd9
    majorScaleChords.D.D6 = DMajor6
    majorScaleChords.D.Em = EMinor
    majorScaleChords.D.Em7 = EMinor7
    majorScaleChords.D.Em9 = EMinor9
    majorScaleChords.D.Emadd9 = EMinorAdd9
    majorScaleChords.D.Gbm = GbMinor
    majorScaleChords.D.Gbm7 = GbMinor7
    majorScaleChords.D.G = GMajor
    majorScaleChords.D.GMaj7 = GMajorMaj7
    majorScaleChords.D.GMaj9 = GMajorMaj9
    majorScaleChords.D.Gadd9 = GMajorAdd9
    majorScaleChords.D.G6 = GMajor6
    majorScaleChords.D.A = AMajor
    majorScaleChords.D.A7 = AMajor7
    majorScaleChords.D.Aadd9 = AMajorAdd9
    majorScaleChords.D.A6 = AMajor6
    majorScaleChords.D.A9 = AMajor9
    majorScaleChords.D.Bm = BMinor
    majorScaleChords.D.Bm7 = BMinor7
    majorScaleChords.D.Bm9 = BMinor9
    majorScaleChords.D.Bmadd9 = BMinorAdd9
    majorScaleChords.D.Dbdim = dddim
    majorScaleChords.D.D5 = D5
    majorScaleChords.D.E5 = E5
    majorScaleChords.D.G5 = G5
    majorScaleChords.D.A5 = A5
    majorScaleChords.D.B5 = B5
    majorScaleChords.D.Gb5 = Gb5

    majorScaleChords.Eb = {}

    majorScaleChords.Eb.Eb = EbMajor
    majorScaleChords.Eb.EbMaj7 = EbMajorMaj7
    majorScaleChords.Eb.EbMaj9 = EbMajorMaj9
    majorScaleChords.Eb.Ebadd9 = EbMajorAdd9
    majorScaleChords.Eb.Eb6 = EbMajor6
    majorScaleChords.Eb.Fm = FMinor
    majorScaleChords.Eb.Fm7 = FMinor7
    majorScaleChords.Eb.Fm9 = FMinor9
    majorScaleChords.Eb.Fmadd9 = FMinorAdd9
    majorScaleChords.Eb.Gm = GMinor
    majorScaleChords.Eb.Gm7 = GMinor7
    majorScaleChords.Eb.Ab = AbMajor
    majorScaleChords.Eb.AbMaj7 = AbMajorMaj7
    majorScaleChords.Eb.AbMaj9 = AbMajorMaj9
    majorScaleChords.Eb.Abadd9 = AbMajorAdd9
    majorScaleChords.Eb.Ab6 = AbMajor6
    majorScaleChords.Eb.Bb = BbMajor
    majorScaleChords.Eb.Bb7 = BbMajor7
    majorScaleChords.Eb.Bbadd9 = BbMajorAdd9
    majorScaleChords.Eb.Bb6 = BbMajor6
    majorScaleChords.Eb.Bb9 = BbMajor9
    majorScaleChords.Eb.Cm = CMinor
    majorScaleChords.Eb.Cm7 = CMinor7
    majorScaleChords.Eb.Cm9 = CMinor9
    majorScaleChords.Eb.Cmadd9 = CMinorAdd9
    majorScaleChords.Eb.Ddim = dDim
    majorScaleChords.Eb.Eb5 = Eb5
    majorScaleChords.Eb.F5 = F5
    majorScaleChords.Eb.G5 = G5
    majorScaleChords.Eb.Ab5 = Ab5
    majorScaleChords.Eb.Bb5 = Bb5
    majorScaleChords.Eb.C5 = C5

    majorScaleChords.E = {}

    majorScaleChords.E.E = EMajor
    majorScaleChords.E.EMajor7 = EMajorMaj7
    majorScaleChords.E.EMajor9 = EMajorMaj9
    majorScaleChords.E.Eadd9 = EMajorAdd9
    majorScaleChords.E.E6 = EMajor6
    majorScaleChords.E.Gbm = GbMinor
    majorScaleChords.E.Gbm7 = GbMinor7
    majorScaleChords.E.Gbm9 = GbMinor9
    majorScaleChords.E.Gbmadd9 = GbMinorAdd9
    majorScaleChords.E.Abm = AbMinor
    majorScaleChords.E.Abm7 = AbMinor7
    majorScaleChords.E.A = AMajor
    majorScaleChords.E.AMaj7 = AMajorMaj7
    majorScaleChords.E.AMaj9 = AMajorMaj9
    majorScaleChords.E.Aadd9 = AMajorAdd9
    majorScaleChords.E.A6 = AMajor6
    majorScaleChords.E.B = BMajor
    majorScaleChords.E.B7 = BMajor7
    majorScaleChords.E.Badd9 = BMajorAdd9
    majorScaleChords.E.B6 = BMajor6
    majorScaleChords.E.B9 = BMajor9
    majorScaleChords.E.Dbm = DbMinor
    majorScaleChords.E.Dbm7 = DbMinor7
    majorScaleChords.E.Dbm9 = DbMinor9
    majorScaleChords.E.Dbmadd9 = DbMinorAdd9
    majorScaleChords.E.Ebdim = ebdim
    majorScaleChords.E.E5 = E5
    majorScaleChords.E.Gb5 = Gb5
    majorScaleChords.E.Ab5 = Ab5
    majorScaleChords.E.A5 = A5
    majorScaleChords.E.B5 = B5
    majorScaleChords.E.Db5 = Db5

    majorScaleChords.F = {}

    majorScaleChords.F.F = FMajor
    majorScaleChords.F.FMaj7 = FMajorMaj7
    majorScaleChords.F.FMaj9 = FMajorMaj9
    majorScaleChords.F.Fadd9 = FMajorAdd9
    majorScaleChords.F.F6 = FMajor6
    majorScaleChords.F.Gm = GMinor
    majorScaleChords.F.Gm7 = GMinor7
    majorScaleChords.F.Gm9 = GMinor9
    majorScaleChords.F.Gmadd9 = GMinorAdd9
    majorScaleChords.F.Am = AMinor
    majorScaleChords.F.Am7 = AMinor7
    majorScaleChords.F.Bb = BbMajor
    majorScaleChords.F.BbMaj7 = BbMajorMaj7
    majorScaleChords.F.BbMaj9 = BbMajorMaj9
    majorScaleChords.F.Bbadd9 = BbMajorAdd9
    majorScaleChords.F.Bb6 = BbMajor6
    majorScaleChords.F.C = CMajor
    majorScaleChords.F.C7 = CMajor7
    majorScaleChords.F.Cadd9 = CMajorAdd9
    majorScaleChords.F.C6 = CMajor6
    majorScaleChords.F.C9 = CMajor9
    majorScaleChords.F.Dm = DMinor
    majorScaleChords.F.Dm7 = DMinor7
    majorScaleChords.F.Dm9 = DMinor9
    majorScaleChords.F.Dmadd9 = DMinorAdd9
    majorScaleChords.F.F5 = F5
    majorScaleChords.F.G5 = G5
    majorScaleChords.F.A5 = A5
    majorScaleChords.F.Bb5 = Bb5
    majorScaleChords.F.C5 = C5
    majorScaleChords.F.D5 = D5
    majorScaleChords.F.Edim = eDim

    majorScaleChords.Gb = {}

    majorScaleChords.Gb.Gb = GbMajor
    majorScaleChords.Gb.GbMaj7 = GbMajorMaj7
    majorScaleChords.Gb.GbMaj9 = GbMajorMaj9
    majorScaleChords.Gb.Gbadd9 = GbMajorAdd9
    majorScaleChords.Gb.Gb6 = GbMajor6
    majorScaleChords.Gb.Abm = AbMinor
    majorScaleChords.Gb.Abm7 = AbMinor7
    majorScaleChords.Gb.Abm9 = AbMinor9
    majorScaleChords.Gb.Abmadd9 = AbMinorAdd9
    majorScaleChords.Gb.Bbm = BbMinor
    majorScaleChords.Gb.Bbm7 = BbMinor7
    majorScaleChords.Gb.B = BMajor
    majorScaleChords.Gb.BMaj7 = BMajorMaj7
    majorScaleChords.Gb.BMaj9 = BMajorMaj9
    majorScaleChords.Gb.Badd9 = BMajorAdd9
    majorScaleChords.Gb.B6 = BMajor6
    majorScaleChords.Gb.Db = DbMajor
    majorScaleChords.Gb.Db7 = DbMajor7
    majorScaleChords.Gb.Dbadd9 = DbMajorAdd9
    majorScaleChords.Gb.Db6 = DbMajor6
    majorScaleChords.Gb.Db9 = DbMajor9
    majorScaleChords.Gb.Ebm = EbMinor
    majorScaleChords.Gb.Ebm7 = EbMinor7
    majorScaleChords.Gb.Ebm9 = EbMinor9
    majorScaleChords.Gb.Ebmadd9 = EbMinorAdd9
    majorScaleChords.Gb.Gb5 = Gb5
    majorScaleChords.Gb.Ab5 = Ab5
    majorScaleChords.Gb.Bb5 = Bb5
    majorScaleChords.Gb.B5 = B5
    majorScaleChords.Gb.Db5 = Db5
    majorScaleChords.Gb.Eb5 = Eb5
    majorScaleChords.Gb.Fdim = fDim

    majorScaleChords.G = {}

    majorScaleChords.G.G = GMajor
    majorScaleChords.G.GMaj7 = GMajorMaj7
    majorScaleChords.G.GMaj9 = GMajorMaj9
    majorScaleChords.G.Gadd9 = GMajorAdd9
    majorScaleChords.G.G6 = GMajor6
    majorScaleChords.G.Am = AMinor
    majorScaleChords.G.Am7 = AMinor7
    majorScaleChords.G.Am9 = AMinor9
    majorScaleChords.G.Amadd9 = AMinorAdd9
    majorScaleChords.G.Bm = BMinor
    majorScaleChords.G.Bm7 = BMinor7
    majorScaleChords.G.C = CMajor
    majorScaleChords.G.CMaj7 = CMajorMaj7
    majorScaleChords.G.CMaj9 = CMajorMaj9
    majorScaleChords.G.Cadd9 = CMajorAdd9
    majorScaleChords.G.C6 = CMajor6
    majorScaleChords.G.D = DMajor
    majorScaleChords.G.D7 = DMajor7
    majorScaleChords.G.Dadd9 = DMajorAdd9
    majorScaleChords.G.D6 = DMajor6
    majorScaleChords.G.D9 = DMajor9
    majorScaleChords.G.Em = EMinor
    majorScaleChords.G.Em7 = EMinor7
    majorScaleChords.G.Em9 = EMinor9
    majorScaleChords.G.Emadd9 = EMinorAdd9
    majorScaleChords.G.G5 = G5
    majorScaleChords.G.A5 = A5
    majorScaleChords.G.B5 = B5
    majorScaleChords.G.B5 = B5
    majorScaleChords.G.D5 = D5
    majorScaleChords.G.C5 = C5
    majorScaleChords.G.E5 = E5
    majorScaleChords.G.Gbdim = gbDim

    majorScaleChords.Ab = {}

    majorScaleChords.Ab.Ab = AbMajor
    majorScaleChords.Ab.AbMaj7 = AbMajorMaj7
    majorScaleChords.Ab.AbMaj9 = AbMajorMaj9
    majorScaleChords.Ab.Abadd9 = AbMajorAdd9
    majorScaleChords.Ab.Ab6 = AbMajor6
    majorScaleChords.Ab.Bbm = BbMinor
    majorScaleChords.Ab.Bbm7 = BbMinor7
    majorScaleChords.Ab.Bbm9 = BbMinor9
    majorScaleChords.Ab.Bbmadd9 = BbMinorAdd9
    majorScaleChords.Ab.Cm = CMinor
    majorScaleChords.Ab.Cm7 = CMinor7
    majorScaleChords.Ab.Db = DbMajor
    majorScaleChords.Ab.DbMaj7 = DbMajorMaj7
    majorScaleChords.Ab.DbMaj9 = DbMajorMaj9
    majorScaleChords.Ab.Dbadd9 = DbMajorAdd9
    majorScaleChords.Ab.Db6 = DbMajor6
    majorScaleChords.Ab.Eb = EbMajor
    majorScaleChords.Ab.Eb7 = EbMajor7
    majorScaleChords.Ab.Ebadd9 = EbMajorAdd9
    majorScaleChords.Ab.Eb6 = EbMajor6
    majorScaleChords.Ab.Eb9 = EbMajor9
    majorScaleChords.Ab.Fm = FMinor
    majorScaleChords.Ab.Fm7 = FMinor7
    majorScaleChords.Ab.Fm9 = FMinor9
    majorScaleChords.Ab.Fmadd9 = FMinorAdd9
    majorScaleChords.Ab.Ab5 = Ab5
    majorScaleChords.Ab.Bb5 = Bb5
    majorScaleChords.Ab.C5 = C5
    majorScaleChords.Ab.Db5 = Db5
    majorScaleChords.Ab.Eb5 = Eb5
    majorScaleChords.Ab.F5 = F5
    majorScaleChords.Ab.Gdim = gDim

    majorScaleChords.A = {}

    majorScaleChords.A.A = AMajor
    majorScaleChords.A.AMaj7 = AMajorMaj7
    majorScaleChords.A.AMaj9 = AMajorMaj9
    majorScaleChords.A.Aadd9 = AMajorAdd9
    majorScaleChords.A.A6 = AMajor6
    majorScaleChords.A.Bm = BMinor
    majorScaleChords.A.Bm7 = BMinor7
    majorScaleChords.A.Bm9 = BMinor9
    majorScaleChords.A.Bmadd9 = BMinorAdd9
    majorScaleChords.A.Dbm = DbMinor
    majorScaleChords.A.Dbm7 = DbMinor7
    majorScaleChords.A.D = DMajor
    majorScaleChords.A.DMaj7 = DMajorMaj7
    majorScaleChords.A.DMaj9 = DMajorMaj9
    majorScaleChords.A.Dadd9 = DMajorAdd9
    majorScaleChords.A.D6 = DMajor6
    majorScaleChords.A.E = EMajor
    majorScaleChords.A.E7 = EMajor7
    majorScaleChords.A.Eadd9 = EMajorAdd9
    majorScaleChords.A.E6 = EMajor6
    majorScaleChords.A.E9 = EMajor9
    majorScaleChords.A.Gbm = GbMinor
    majorScaleChords.A.Gbm7 = GbMinor7
    majorScaleChords.A.Gbm9 = GbMinor9
    majorScaleChords.A.Gbmadd9 = GbMinorAdd9
    majorScaleChords.A.A5 = A5
    majorScaleChords.A.B5 = B5
    majorScaleChords.A.Db5 = Db5
    majorScaleChords.A.D5 = D5
    majorScaleChords.A.E5 = E5
    majorScaleChords.A.Gb5 = Gb5
    majorScaleChords.A.Abdim = abDim

    majorScaleChords.Bb = {}

    majorScaleChords.Bb.Bb = BbMajor
    majorScaleChords.Bb.BbMaj7 = BbMajorMaj7
    majorScaleChords.Bb.BbMaj9 = BbMajorMaj9
    majorScaleChords.Bb.Bbadd9 = BbMajorAdd9
    majorScaleChords.Bb.Bb6 = BbMajor6
    majorScaleChords.Bb.Cm = CMinor
    majorScaleChords.Bb.Cm7 = CMinor7
    majorScaleChords.Bb.Cm9 = CMinor9
    majorScaleChords.Bb.Cmadd9 = CMinorAdd9
    majorScaleChords.Bb.Dm = DMinor
    majorScaleChords.Bb.Dm7 = DMinor7
    majorScaleChords.Bb.Eb = EbMajor
    majorScaleChords.Bb.EbMaj7 = EbMajorMaj7
    majorScaleChords.Bb.EbMaj9 = EbMajorMaj9
    majorScaleChords.Bb.Ebadd9 = EbMajorAdd9
    majorScaleChords.Bb.Eb6 = EbMajor6
    majorScaleChords.Bb.F = FMajor
    majorScaleChords.Bb.F7 = FMajor7
    majorScaleChords.Bb.Fadd9 = FMajorAdd9
    majorScaleChords.Bb.F6 = FMajor6
    majorScaleChords.Bb.F9 = FMajor9
    majorScaleChords.Bb.Gm = GMinor
    majorScaleChords.Bb.Gm7 = GMinor7
    majorScaleChords.Bb.Gm9 = GMinor9
    majorScaleChords.Bb.Gmadd9 = GMinorAdd9
    majorScaleChords.Bb.Bb5 = Bb5
    majorScaleChords.Bb.C5 = C5
    majorScaleChords.Bb.D5 = D5
    majorScaleChords.Bb.Eb5 = Eb5
    majorScaleChords.Bb.F5 = F5
    majorScaleChords.Bb.G5 = G5
    majorScaleChords.Bb.Adim = aDim

    majorScaleChords.B = {}

    majorScaleChords.B.B = BMajor
    majorScaleChords.B.BMaj7 = BMajorMaj7
    majorScaleChords.B.BMaj9 = BMajorMaj9
    majorScaleChords.B.Badd9 = BMajorAdd9
    majorScaleChords.B.B6 = BMajor6
    majorScaleChords.B.Dbm = DbMinor
    majorScaleChords.B.Dbm7 = DbMinor7
    majorScaleChords.B.Dbm9 = DbMinor9
    majorScaleChords.B.Dbmadd9 = DbMinorAdd9
    majorScaleChords.B.Ebm = EbMinor
    majorScaleChords.B.Ebm7 = EbMinor7
    majorScaleChords.B.E = EMajor
    majorScaleChords.B.EMaj7 = EMajorMaj7
    majorScaleChords.B.EMaj9 = EMajorMaj9
    majorScaleChords.B.Eadd9 = EMajorAdd9
    majorScaleChords.B.E6 = EMajor6
    majorScaleChords.B.Gb = GbMajor
    majorScaleChords.B.Gb7 = GbMajor7
    majorScaleChords.B.Gbadd9 = GbMajorAdd9
    majorScaleChords.B.Gb6 = GbMajor6
    majorScaleChords.B.Gb9 = GbMajor9
    majorScaleChords.B.Abm = AbMinor
    majorScaleChords.B.Abm7 = AbMinor7
    majorScaleChords.B.Abm9 = AbMinor9
    majorScaleChords.B.Abmadd9 = AbMinorAdd9
    majorScaleChords.B.B5 = B5
    majorScaleChords.B.Db5 = Db5
    majorScaleChords.B.Eb5 = Eb5
    majorScaleChords.B.E5 = E5
    majorScaleChords.B.Gb5 = Gb5
    majorScaleChords.B.Ab5 = Ab5
    majorScaleChords.B.Bbdim = bbDim
}
