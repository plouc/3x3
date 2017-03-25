import Chord    from '../charts/chord/Chord'
import chordGui from '../charts/chord/gui'
import setup    from './setup'

const { scene, gui, render } = setup({
    width:    800,
    height:   800,
    renderer: { clearColor: '#000000' },
    ground:   { color: '#362d1f' },
})

const chord = new Chord({})
chord.position.y = 10
chord.setData([
    ['groupA', 'groupB', 'groupC', 'groupD', 'groupC', 'groupD', 'groupE'],
    [   11975,     5871,     8916,     2868,     2468,     2867,     8624],
    [    1951,    10048,     2060,     6171,     3571,     9653,     3419],
    [    8010,    16145,     8090,     8045,     7639,     2476,     9752],
    [    1013,      990,      940,     6907,     8756,     2765,     9507],
    [    4724,     6545,     5630,     3967,      941,     1000,     3856],
    [    9756,     1149,     4534,     8045,     7652,     7845,      897],
    [     985,    12569,      784,    12023,     3474,     2457,    11476],
])
chord.compute()
chord.update()
scene.add(chord)
chordGui(gui, chord)

render()
