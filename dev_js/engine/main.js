import { Assets } from 'pixi.js'
import { fonts, uploadAssets } from './loader'
import { initFontStyles } from './fonts'
import { startGame } from '../game'
import { EventHub, events, /*setLevel*/ } from './events'

let level = null
EventHub.on( events.setLevel, (data) => level = data )

// preload fonts
Assets.addBundle('fonts', fonts)
Assets.loadBundle('fonts').then( fontsData => {
    // update font values by font family
    for(let key in fontsData) fonts[key] = fontsData[key].family
    initFontStyles()
    uploadAssets( awaitLevel )
})

function awaitLevel() {
    if (level) return startGame(level)
    setTimeout(awaitLevel, 100)
    console.log("awaitLevel")
}


/*
const levelTest = [
    [0, 0, 1, 1, 1, 0, 0, 1, 0],
    [1, 1, 1, 0, 1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 0, 0, 0],
    [3, 0, 1, 1, 0, 0, 1, 1, 1],
    [0, 0, 1, 1, 0, 0, 1, 2, 1],
    [0, 0, 0, 1, 1, 1, 1, 1, 1],
]

setTimeout( () => setLevel( levelTest ), 1000 )
*/
