import { Assets } from 'pixi.js'
import { fonts, uploadAssets } from './loader'
import { initFontStyles } from './fonts'
import { startGame } from '../game'
import { EventHub, events, setLevel, setCommands, changeBg, stopBg, showTestBot, editCloudSpeed } from './events'
import { ACTIONS, CLOUDS } from "../constants"

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

const cloudSpeedSpan = document.getElementById('cloudSpeedSpan')

const commandRightSpan = document.getElementById('commandRightSpan')
commandRightSpan.onclick = () => {commands.push(ACTIONS.right); actionsStack.innerText += "↷"}
const commandLeftSpan = document.getElementById('commandLeftSpan')
commandLeftSpan.onclick = () => {commands.push(ACTIONS.left); actionsStack.innerText += "↶"}
const commandForwardSpan = document.getElementById('commandForwardSpan')
commandForwardSpan.onclick = () => {commands.push(ACTIONS.forward); actionsStack.innerText += "⬆"}
const commandActionSpan =document.getElementById('commandActionSpan')
commandActionSpan.onclick = () => {commands.push(ACTIONS.use); actionsStack.innerText += "✪"}
const commandStartSpan = document.getElementById('commandStartSpan')
commandStartSpan.onclick = () => {
    actionsStack.innerText = "";
    setCommands({ commands: [...commands], callback: commandsDone, })
    commands = []
}
const testBotSpan = document.getElementById('testBotSpan')
testBotSpan.onclick = showTestBot
const bgSpeedSpan = document.getElementById('bgSpeedSpan')
bgSpeedSpan.onclick = stopBg
const cloudSpeedSupSpan = document.getElementById('cloudSpeedSupSpan')
cloudSpeedSupSpan.onclick = () => changeCloudSpeed(false)
const cloudSpeedAddSpan = document.getElementById('cloudSpeedAddSpan')
cloudSpeedAddSpan.onclick = () => changeCloudSpeed(true)

const tempClodSpeed = {
    minSpeed: CLOUDS.minSpeed,
    maxSpeed: CLOUDS.maxSpeed
}

function changeCloudSpeed(isAdd) {
    tempClodSpeed.minSpeed += (isAdd) ? 0.01 : -0.01
    if (tempClodSpeed.minSpeed <= 0) tempClodSpeed.minSpeed = 0
    tempClodSpeed.maxSpeed = tempClodSpeed.minSpeed * 2

    cloudSpeedSpan.innerText = ((tempClodSpeed.minSpeed + tempClodSpeed.maxSpeed) * 0.5).toFixed(2)

    editCloudSpeed({...tempClodSpeed})
}

applyButton.onclick = () => {
    const data = JSON.parse(testDataText.value.replace(/,\s*]/g, ']').replace(/,\s*},/g, '},'))

    cloudSpeedSpan.innerText = ((CLOUDS.minSpeed + CLOUDS.maxSpeed) * 0.5).toFixed(2)
    
    setLevel( data )
    helpText.remove()

    applyButton.innerText = 'ПЕРЕЗАПУСТИТЬ'
    applyButton.onclick = () => location.reload()
    applyButton.blur()

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

        case "ArrowDown":
            changeBg()
            break
        case "KeyS":
            stopBg()
            break
        case "KeyT":
            showTestBot()
            break

        case "Space":
            commands.push(ACTIONS.use)
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

        case "Comma" /* < */:
            actionsStack.innerText = ""
            setCommands({
                commands: [...commands],
                callback: commandsDone,
            })
            commands = []
            break
        case "Period" /* > */:
            actionsStack.innerText = ""
            setCommands({
                commands: [...commands],
                callback: commandsDone,
            })
            commands = []
            break
    }
    console.log(key.code)
})

function commandsDone(result) {
    alert(result ? 'Задание выполнено' : ' =( В ваших командах была недоработка...')
}