import { Assets } from 'pixi.js'
import { fonts, uploadAssets } from './loader'
import { initFontStyles } from './fonts'
import { startGame } from '../game'
import { EventHub, events, setLevel, setCommands } from './events'
import { ACTIONS } from "../constants"

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
}

/////////////////////////////////////

//    НИЖЕ ВЕСЬ КОД ДЛЯ ТЕСТОВ     //

////////////////////////////////////

const helpText = document.getElementById('helpText')
const testDataText = document.getElementById('testData')
const applyButton = document.getElementById('applyTestData')

const helpActionsText = document.getElementById('helpActionsText')
const actionsStack = document.getElementById('actionsStack')

applyButton.onclick = () => {
    const data = JSON.parse(testDataText.value.replace(/,\s*]/g, ']').replace(/,\s*},/g, '},'))
    
    setLevel( data )
    helpText.remove()
    applyButton.remove()

    helpActionsText.style.display = "block"
    actionsStack.style.display = "block"
}

//

let commands = [] 
document.addEventListener('keydown', (key) => {
    switch(key.code) {
        case "ArrowUp":
            commands.push(ACTIONS.forward)
            actionsStack.innerText += "⬆"
            break

        case "ArrowLeft":
            commands.push(ACTIONS.left)
            actionsStack.innerText += "↶"
            break

        case "ArrowRight":
            commands.push(ACTIONS.right)
            actionsStack.innerText += "↷"
            break

        case "Space":
            // commands.push(ACTIONS.use)
            actionsStack.innerText += "✪"
            break

        case "Enter":
            actionsStack.innerText = ""
            setCommands({
                commands: [...commands],
                callback: commandsDone,
            })
            commands = []
            break
    }
    // console.log(key.code)
})

function commandsDone(result) {
    console.log('commandsDone', result)
}