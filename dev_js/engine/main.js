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

let startMap = {
    "map":[
        [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
        [ 0,  0,  1,  1,  1,  0,  0,  1,  1],
        [ 1,  1,  1,  0,  1,  0,  0,  1,  0],
        [ 1,  0,  0,  0,  1,  0,  0,  1,  0],
        [91,  0, 93,  8,  1,  1,  0,  0,  0],
        [51,  0,  1,  1,  0,  0,  1,  1, 61],
        [ 1,  0,  7,  1,  0,  0,  1,  2,  1],
        [ 3,  0,  0,  1, 43,  1,  1,  1,  1],
        [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
    ],
    "botDirection": "down",
    "inventory":["key_green"]
}
const maxInventorySize = 5

const MAP_DATA = {
    0 :  {name: 'empty', char: '', color: ''},
    1 :  {name: 'ceil', char: '', color: '#ff9800'},
    2 :  {name: 'bot', charData: { left: '⇦', right: '⇨', up: '⇧', down: '⇩' }, color: '#00ffff'},
    3 :  {name: 'target', char: '🏳', color: '#ffffff'},
    41 : {name: 'door_h_red', char: '⇔', color: 'red'},
    42 : {name: 'door_h_yellow', char: '⇔', color: 'yellow'},
    43 : {name: 'door_h_green', char: '⇔', color: 'green'},
    44 : {name: 'door_h_blue', char: '⇔', color: 'blue'},
    51 : {name: 'door_v_red', char: '⇕', color: 'red'},
    52 : {name: 'door_v_yellow', char: '⇕', color: 'yellow'},
    53 : {name: 'door_v_green', char: '⇕', color: 'green'},
    54 : {name: 'door_v_blue', char: '⇕', color: 'blue'},
    61 : {name: 'key_red', char: '⚿', color: 'red'},
    62 : {name: 'key_yellow', char: '⚿', color: 'yellow'},
    63 : {name: 'key_green', char: '⚿', color: 'green'},
    64 : {name: 'key_blue', char: '⚿', color: 'blue'},
    7 :  {name: 'gun', char: '🗲', color: '#ff9800'},
    8 :  {name: 'stone', char: '⬤', color: '#777777'},
    91 : {name: 'monster_up', char: '🢕', color: '#b9006c'},
    92 : {name: 'monster_right', char: '🢖', color: '#b9006c'},
    93 : {name: 'monster_down', char: '🢗', color: '#b9006c'},
    94 : {name: 'monster_left', char: '🢔', color: '#b9006c'},
}
const MAP_DATA_KEYS = [0, 1, 2, 3, 41, 42, 43, 44, 51, 52, 53, 54, 61, 62, 63, 64, 7, 8, 91, 92, 93, 94]

const INVENTORY_DATA = {
    key_red : {color: 'red', char: '⚿'},
    key_yellow : {color: 'yellow', char: '⚿'},
    key_green : {color: 'green', char: '⚿'},
    key_blue : {color: 'blue', char: '⚿'},
    gun : {color: 'orange', char: '🗲'},
    empty : {color: 'gray', char: '⃞'}
}
const INVENTORY_LIST = ['key_red', 'key_yellow', 'key_green', 'key_blue', 'gun', 'empty']

let tableSize = startMap.map.length > startMap.map[0].length ? startMap.map.length : startMap.map[0].length

let isTargetOnMap = false

document.body.onload = () => {
    // TAG REFS
    const configContainer = document.getElementById('config-container')
    const controlContainer = document.getElementById('control-container')
    controlContainer.style.display = 'none'
    const gameSettingsContainer = document.getElementById('game-settings-container')
    gameSettingsContainer.style.display = 'none'

    const inventoryLine = document.getElementById('inventory-line')
    const mapTable = document.getElementById('map-table')
    const applyButton = document.getElementById('applySettings')
    applyButton.onclick = () => {
        configContainer.style.display = 'none'
        controlContainer.style.display = 'block'
        gameSettingsContainer.style.display = 'block'

        // проверка лишних запятых в JSON при ручном заполнении
        // const startMap = JSON.parse(testDataText.value.replace(/,\s*]/g, ']').replace(/,\s*},/g, '},'))
        setLevel( startMap )
        activateControl()
    }

    updateJSON()

    // INVENTORY
    for(let i = 0; i < maxInventorySize; i++) {
        const inventoryCeil = document.createElement('td')
        inventoryCeil.onclick = () => changeInventorySettings(inventoryCeil)
        const inventoryValue = startMap.inventory[i]
        if (inventoryValue) {
            inventoryCeil.style.backgroundColor = INVENTORY_DATA[inventoryValue].color
            inventoryCeil.innerText = INVENTORY_DATA[inventoryValue].char
            inventoryCeil.dataset.key = inventoryValue
        } else {
            inventoryCeil.style.backgroundColor = INVENTORY_DATA.empty.color
            inventoryCeil.innerText = INVENTORY_DATA.empty.char
            inventoryCeil.dataset.key = 'empty'
        }
        inventoryLine.append(inventoryCeil)
    }
    
    // MAP SIZE
    const valueMapSizeSpan = document.getElementById('valueMapSize')
    valueMapSizeSpan.innerText = tableSize

    const supMapSizeButton = document.getElementById('supMapSize')
    supMapSizeButton.onclick = () => resizeTable(false, valueMapSizeSpan, mapTable)

    const addMapSizeButton = document.getElementById('addMapSize')
    addMapSizeButton.onclick = () => resizeTable(true, valueMapSizeSpan, mapTable)

    // MAP TABLE
    for(let y = 0; y < tableSize; y++) {
        const row = document.createElement('tr')
        mapTable.append(row)
        for(let x = 0; x < tableSize; x++) {
            const ceilData = startMap.map[y][x]
            const ceil = document.createElement('td')
            ceil.dataset.x = x
            ceil.dataset.y = y
            ceil.dataset.ceilData = ceilData
            ceil.style.backgroundColor = MAP_DATA[ceilData].color
            if (ceilData === 2) {
                if (!startMap.botDirection) startMap.botDirection = "down"
                ceil.innerText = MAP_DATA[ceilData].charData[startMap.botDirection]
            } else {
                ceil.innerText = MAP_DATA[ceilData].char
            }
            if (ceilData === 3) isTargetOnMap = true
            
            ceil.addEventListener('click', getCeilLeftClick)
            ceil.addEventListener('contextmenu', getCeilRightClick)

            row.append(ceil)
        }
    }

    updateJSON()
}

function updateJSON() {
    const data = {...startMap}
    data.map = startMap.map.map(arr => `[ ${arr.join(', ')} ]`)
    document.getElementById('jsonValue').value = JSON.stringify(data, null, 4)
}

function changeInventorySettings(inventoryCeil) {
    if (inventoryCeil.dataset.key !== 'empty') {
        startMap.inventory = startMap.inventory.filter( item => item !== inventoryCeil.dataset.key )
    }

    let valueIndex = INVENTORY_LIST.indexOf(inventoryCeil.dataset.key)
    let currentKey = INVENTORY_LIST[valueIndex]
    do {
        valueIndex++
        if (valueIndex >= INVENTORY_LIST.length) valueIndex = 0
        currentKey = INVENTORY_LIST[valueIndex]
        if (currentKey === 'empty') break;
    } while( startMap.inventory.includes( currentKey ) );

    inventoryCeil.dataset.key = currentKey
    if (currentKey !== 'empty') startMap.inventory.push(currentKey)
    inventoryCeil.style.backgroundColor = INVENTORY_DATA[currentKey].color
    inventoryCeil.innerText = INVENTORY_DATA[currentKey].char
    
    updateJSON()
}

function resizeTable(isAdd, valueSpan, table) {
    tableSize += isAdd ? 1 : -1
    if (tableSize < 3) {
        tableSize = 3
        return
    }
    if (tableSize > 13) {
        tableSize = 13
        return
    }

    valueSpan.innerText = tableSize

    const rows = table.querySelectorAll('tr')
    
    if (isAdd) {

        rows.forEach( (r, y) => {
            const ceil = document.createElement('td')
            ceil.dataset.x = tableSize - 1
            ceil.dataset.y = y
            ceil.dataset.ceilData = 0
            ceil.addEventListener('click', getCeilLeftClick)
            ceil.addEventListener('contextmenu', getCeilRightClick)
            //ceil.style.backgroundColor = 'none'
            r.append(ceil)
            startMap.map[y].push(0)
        })
        const row = document.createElement('tr')
        table.append(row)
        const startMapNewRow = []
        for(let x = 0; x < tableSize; x++) {
            const ceil = document.createElement('td')
            ceil.dataset.x = x
            ceil.dataset.y = tableSize - 1
            ceil.dataset.ceilData = 0
            ceil.addEventListener('click', getCeilLeftClick)
            ceil.addEventListener('contextmenu', getCeilRightClick)
            //ceil.style.backgroundColor = 'none'
            row.append(ceil)
            startMapNewRow.push(0)
        }
        startMap.map.push(startMapNewRow)

    } else {

        const lastY = tableSize
        rows.forEach( (row, y) => {
            const ceils = row.querySelectorAll('td')
            if (y === lastY) {
                ceils.forEach( ceil => {
                    ceil.removeEventListener('click', getCeilLeftClick)
                    ceil.removeEventListener('contextmenu', getCeilRightClick)
                    if (ceil.dataset.ceilData === '2') startMap.botDirection = ''
                    if (ceil.dataset.ceilData === '3') isTargetOnMap = false
                    ceil.remove()
                })
                row.remove()
            } else {
                ceils[ceils.length - 1].removeEventListener('click', getCeilLeftClick)
                ceils[ceils.length - 1].removeEventListener('contextmenu', getCeilRightClick)
                if (ceils[ceils.length - 1].dataset.ceilData === '2') startMap.botDirection = ''
                if (ceils[ceils.length - 1].dataset.ceilData === '3') isTargetOnMap = false
                ceils[ceils.length - 1].remove()
                startMap.map[y].pop()
            }
        })
        startMap.map.pop()
    }

    updateJSON()
}

function getCeilLeftClick(event) {
    const ceil = event.target

    if (ceil.dataset.ceilData === '0') {
        startMap.map[+ceil.dataset.y][+ceil.dataset.x] = 1
        ceil.dataset.ceilData = 1
        ceil.style.backgroundColor = MAP_DATA[1].color
        ceil.innerText = MAP_DATA[1].char
    } else {
        if (ceil.dataset.ceilData === '2') startMap.botDirection = ''
        if (ceil.dataset.ceilData === '3') isTargetOnMap = false

        startMap.map[+ceil.dataset.y][+ceil.dataset.x] = 0
        ceil.dataset.ceilData = 0
        ceil.style.backgroundColor = MAP_DATA[0].color
        ceil.innerText = MAP_DATA[0].char
    }

    updateJSON()
}

function getCeilRightClick(event) {
    event.preventDefault()

    if (event.target.dataset.ceilData === '0') {
        return getCeilLeftClick(event)
    }

    const ceil = event.target
    const ceilX = +ceil.dataset.x
    const ceilY = +ceil.dataset.y
    const ceilData = +ceil.dataset.ceilData   

    // if bot is not exist -> add bot
    if (!startMap.botDirection) {
        startMap.botDirection = 'down'
        startMap.map[ceilY][ceilX] = 2
        ceil.dataset.ceilData = 2
        ceil.style.backgroundColor = MAP_DATA[2].color
        ceil.innerText = MAP_DATA[2].charData[startMap.botDirection]
        return
    }

    // if click in bot
    if(ceilData === 2) {
        switch(startMap.botDirection) {
            case 'down': startMap.botDirection = 'left'; break;
            case 'left': startMap.botDirection = 'up'; break;
            case 'up': startMap.botDirection = 'right'; break;
            case 'right': startMap.botDirection = ''; break;
            default: startMap.botDirection = ''; break;
        }

        if (startMap.botDirection) {
            ceil.innerText = MAP_DATA[2].charData[startMap.botDirection]
        } else {
            ceil.style.backgroundColor = MAP_DATA[1].color
            ceil.innerText = MAP_DATA[1].char
            ceil.dataset.ceilData = 1
            startMap.map[ceilY][ceilX] = 1
        }
        return
    }

    // check target on map
    if (!isTargetOnMap) {
        isTargetOnMap = true
        startMap.map[ceilY][ceilX] = 3
        ceil.dataset.ceilData = 3
        ceil.style.backgroundColor = MAP_DATA[3].color
        ceil.innerText = MAP_DATA[3].char
        return
    }

    // remove target from map
    if (ceilData === 3) {
        isTargetOnMap = false
        startMap.map[ceilY][ceilX] = 1
        ceil.dataset.ceilData = 1
        ceil.innerText = MAP_DATA[1].char
        ceil.style.backgroundColor = MAP_DATA[1].color
        return
    }

    let nextIndex = MAP_DATA_KEYS.indexOf(ceilData) + 1
    if (nextIndex > MAP_DATA_KEYS.length) nextIndex = 1
    if (nextIndex < 4) nextIndex = 4
    const nextCeilData = MAP_DATA_KEYS[nextIndex]  
    startMap.map[ceilY][ceilX] = nextCeilData
    ceil.dataset.ceilData = nextCeilData
    ceil.style.backgroundColor = MAP_DATA[nextCeilData].color
    ceil.innerText = MAP_DATA[nextCeilData].char

    updateJSON()
}

// COMMANDS

let actionStackDiv = null
let actionStatusDiv = null
let commands = []

function activateControl() {
    actionStackDiv = document.getElementById('action-stack')
    actionStatusDiv = document.getElementById('action-status')

    setupSettings()

    document.getElementById('action-go').onclick = (e) => addActionToStack(ACTIONS.forward, e.target.innerText)
    document.getElementById('action-left').onclick = (e) => addActionToStack(ACTIONS.left, e.target.innerText)
    document.getElementById('action-right').onclick = (e) => addActionToStack(ACTIONS.right, e.target.innerText)
    document.getElementById('action-use').onclick = (e) => addActionToStack(ACTIONS.use, e.target.innerText)

    document.getElementById('action-clear-all').onclick = getClearAllClick
    document.getElementById('action-clear-last').onclick = getClearLastClick
    document.getElementById('action-start').onclick = getStartClick

    document.getElementById('restart').onclick = () => location.reload()
}

function addActionToStack(action, char) {
    actionStackDiv.innerText += char
    commands.push(action)
}

function getClearAllClick() {
    actionStackDiv.innerText = ''
    commands = []
}

function getClearLastClick() {
    actionStackDiv.innerText = actionStackDiv.innerText.slice(0, -1)
    commands.pop()
}

function getStartClick() {
    if (commands.length === 0) return

    actionStatusDiv.innerText = 'Выполняю команды'
    actionStatusDiv.style.backgroundColor = '#ffff00'
    setCommands({
        commands: [...commands],
        callback: commandsDone,
    })
}

function commandsDone(result) {
    actionStatusDiv.innerText = result ? 'Выполнено =)' : ' =( Недоработка...'
    actionStatusDiv.style.backgroundColor = result ? '#00ff00' : '#ff0000'
}

// SETTINGS

const tempClodSpeed = {
    minSpeed: CLOUDS.minSpeed,
    maxSpeed: CLOUDS.maxSpeed
}

function setupSettings() {
    const showHideTestBot = document.getElementById('test-bot')
    showHideTestBot.onclick = () => {
        if (showHideTestBot.innerText.includes('скрыть')) {
            showHideTestBot.innerText = 'показать тестового бота'
        } else {
            showHideTestBot.innerText = 'скрыть тестового бота'
        }
        showTestBot()
    }

    const startStopMoveBG = document.getElementById('background-move')
    startStopMoveBG.onclick = () => {
        if (startStopMoveBG.innerText.includes('стоп')) {
            startStopMoveBG.innerText = 'старт фон'
        } else {
            startStopMoveBG.innerText = 'стоп фон'
        }
        stopBg()
    }

    const changeBG = document.getElementById('background-change')
    changeBG.onclick = () => changeBg()

    const cloudsSpeedValue = document.getElementById('clouds-speed')
    cloudsSpeedValue.innerText = ((CLOUDS.minSpeed + CLOUDS.maxSpeed) * 0.5).toFixed(2)

    const supCloudsSpeed = document.getElementById('clouds-sup-speed')
    supCloudsSpeed.onclick = () => changeCloudSpeed(false)

    const addCloudsSpeed = document.getElementById('clouds-add-speed')
    addCloudsSpeed.onclick = () => changeCloudSpeed(true)

    function changeCloudSpeed(isAdd) {
        tempClodSpeed.minSpeed += (isAdd) ? 0.01 : -0.01
        if (tempClodSpeed.minSpeed <= 0) tempClodSpeed.minSpeed = 0
        tempClodSpeed.maxSpeed = tempClodSpeed.minSpeed * 2
    
        cloudsSpeedValue.innerText = ((tempClodSpeed.minSpeed + tempClodSpeed.maxSpeed) * 0.5).toFixed(2)
    
        editCloudSpeed({...tempClodSpeed})
    }
}