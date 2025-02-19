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

const startMap = {
    "map":[
        [ 0,  0,  0,  0,  0,  0,  0,  0,  0],
        [ 0,  0,  1,  1,  1,  0,  0,  1,  1],
        [ 1,  1,  1,  0,  1,  0,  0,  1,  0],
        [ 1,  0,  0,  0,  1,  0,  0,  1,  0],
        [91,  0, 92,  8,  1,  1,  0,  0,  0],
        [41,  0,  1,  1,  0,  0,  1,  1, 61],
        [ 1,  0,  7,  1,  0,  0,  1,  2,  1],
        [ 3,  0,  0,  1, 53,  1,  1,  1,  1],
        [ 0,  0,  0,  0,  0,  0,  0,  0,  0]
    ],
    "botDirection": "down",
    "inventory":["key_green"]
}

const inventoryTableUnicode = {
    key_red : {color: 'red', icon: '⚿'},
    key_yellow : {color: 'yellow', icon: '⚿'},
    key_green : {color: 'green', icon: '⚿'},
    key_blue : {color: 'blue', icon: '⚿'},
    gun : {color: 'orange', icon: '🗲'},
    empty : {color: 'gray', icon: '⃞'}
}

const mapTableUnicode = {
    0 : '',
    1 : '🏻⃞',
    2 : { left: '⇦', right: '⇨', up: '⇧', down: '⇩' },
    3 : '✵',
    4 : '⇕',
    5 : '⇔',
    6 : '⚿',
    7 : '🗲',
    8 : '🝙',
    9 : { right: '⍈', down: '⍗' },
}
const mapColorIndex = { 1 : 'red', 2 : 'yellow', 3 : 'green', 4 : 'blue' }
const mapSideIndex = { 1 : 'right', 2 : 'down', 3 : 'left', 4 : 'up' }

let tableSize = startMap.map.length > startMap.map[0].length ? startMap.map.length : startMap.map[0].length

document.body.onload = () => {
    // INVENTORY
    const inventoryLine = document.getElementById('inventory-line')
    for(let i = 0; i < 5; i++) {
        const inventoryCeil = document.createElement('td')
        inventoryCeil.onclick = () => console.log('+')
        inventoryCeil.className = 'inventory-ceil'
        if (startMap.inventory[i]) {
            inventoryCeil.style.backgroundColor = inventoryTableUnicode[ startMap.inventory[i] ].color
            inventoryCeil.innerText = inventoryTableUnicode[ startMap.inventory[i] ].icon
        } else {
            inventoryCeil.style.backgroundColor = inventoryTableUnicode.empty.color
            inventoryCeil.innerText = inventoryTableUnicode.empty.icon
        }
        inventoryLine.append(inventoryCeil)
    }
    
    // MAP SIZE
    const valueMapSizeSpan = document.getElementById('valueMapSize')
    valueMapSizeSpan.innerText = tableSize

    const supMapSizeButton = document.getElementById('supMapSize')
    supMapSizeButton.onclick = () => resizeTable(false)

    const addMapSizeButton = document.getElementById('addMapSize')
    addMapSizeButton.onclick = () => resizeTable(true)

    function resizeTable(isAdd) {
        tableSize += isAdd ? 1 : -1
        if (tableSize < 1) tableSize = 1
        if (tableSize > 13) tableSize = 13
        valueMapSizeSpan.innerText = tableSize
    }

    // MAP TABLE
    const mapTable = document.getElementById('map-table')

    for(let y = 0; y < tableSize; y++) {
        const row = document.createElement('tr')
        row.dataset.y = y
        mapTable.append(row)
        for(let x = 0; x < tableSize; x++) {
            const ceil = document.createElement('td')
            ceil.dataset.x = x
            ceil.addEventListener('click', getCeilClick)
            const ceilData = startMap.map[y][x]

            if (ceilData !== 0) ceil.style.backgroundColor = '#ff9800'

            switch(ceilData) {
                case 2 : ceil.innerText = mapTableUnicode[2][startMap.botDirection]; break;
                case 3 : ceil.innerText = mapTableUnicode[3]; break;

                case 41:
                case 42:
                case 43:
                case 44:
                case 51:
                case 52:
                case 53:
                case 54:
                    ceil.style.backgroundColor = mapColorIndex[(''+ceilData)[1]]
                    ceil.innerText = mapTableUnicode[(''+ceilData)[0]]
                break

                case 61:
                case 62:
                case 63:
                case 64:
                    ceil.style.backgroundColor = mapColorIndex[(''+ceilData)[1]]
                    ceil.innerText = mapTableUnicode[(''+ceilData)[0]]
                break

                case 7: ceil.innerText = mapTableUnicode[7]; break;
                case 8: ceil.innerText = mapTableUnicode[8]; break;

                case 91:
                case 92:
                    ceil.style.backgroundColor = 'maroon'
                    ceil.innerText = mapTableUnicode[9][ mapSideIndex[(''+ceilData)[1]] ]
                break 
            }
            row.append(ceil)
        }
    }


    function getCeilClick(event) {
        const ceil = event.target
        ceil.innerText = '+'
        console.log( ceil)
    }
}

/*

const HTML = `
<div id="helpText" style="font-size: 16px; padding: 20px;">
                    <b>"map" - карта</b><br>
                     0 - пустота; 1 - ⃞ пустая клетка; 2 - робот; 3 - целевая клетка;<br>
                     41, 42, 43, 44 - ▥ Дверь ⬍ (красная, желтая, зеленая, синяя) - чтобы войти нужен ключ;<br>
                     51, 52, 53, 54 - ▤ Дверь ⬌ (красная, желтая, зеленая, синяя) - чтобы войти нужен ключ;<br>
                     61, 62, 63, 64 - Ключ (красный, желтый, зеленый, синий) наступил - собрал;<br>
                     7 - оружие (действие с оружием напротив монстра - уничтожит монстра)<br>
                     8 - камень, действие - сместит в клетку напротив бота<br>
                     91, 92 - монстр (вниз, право) - уничтожит действие с оружием напротив монстра<br>
                    <br>
                    <b>"botDirection" - начальное направление робота</b><br>
                    "left" - влево (смотрит в верхний левый угол)<br>
                    "right" - вправо (смотрит в нижний правый угол)<br>
                    "up" - вверх (смотрит в верхний правый угол)<br>
                    "down" - вниз (смотрит в нижний левый угол)<br>
                    <br>
                    <b>"inventory" - список стартового инвентаря</b><br>
                    "key_red" - ⚿ красный ключ<br>
                    "key_yellow" - ⚿ желтый ключ<br>
                    "key_green" - ⚿ зеленый ключ<br>
                    "key_blue" - ⚿ синий ключ<br>
                    "gun" - оружие (для атаки врага)<br>
                </div>
                <div id="map-generator" style="font-size: 16px; padding: 20px;">
                    <label for="map-size">размер поля:</label>
                    <input type="number" value=1 min=1 step=1 id="map-size">
                    <table></table>
                </div>
                <textarea id="testData" style="width: 100%; height: 250px; background-color: #00000077; color: white; font-weight: bold; font-size: 14px;"> 
                </textarea>
                
                <div id="helpActionsText" style="font-size: 16px; padding: 20px 20px 0; display: none;">
                    <b>ДОСТУПНЫЕ КОМАНДЫ:</b><br>
                    <span id="commandRightSpan" style="cursor: pointer;">[↷]</span> (стрелка вправо) - повернуть направо;<br>
                    <span id="commandLeftSpan" style="cursor: pointer;">[↶]</span> (стрелка влево) - повернуть налево;<br>
                    <span id="commandForwardSpan" style="cursor: pointer;">[⬆]</span> (стрелка вверх) - Шаг вперед;<br>
                    <span id="commandActionSpan" style="cursor: pointer;">[✪]</span> (пробел) - выполнить действие (использовать оружие / толкнуть камень)<br>
                    <b><span id="commandStartSpan" style="cursor: pointer;">[Enter]</span></b> - Запустить выполнение команд<br>
                    <br>
                    <span id="testBotSpan" style="cursor: pointer;"><b>[t]</b></span> - показать/скрыть доп. бота в правильном ракурсе<br>
                    <span id="bgSpeedSpan" style="cursor: pointer;"><b>[s]</b></span> - старт/стоп движение фонового изображения<br>
                    <span id="cloudSpeedSupSpan" style="cursor: pointer;"><b>[&lt;]</b></span><span id="cloudSpeedSpan"></span><span id="cloudSpeedAddSpan" style="cursor: pointer;"><b>[&gt;]</b></span> +/- скорость облаков
                    <br>
                    <br><b>КОМАНДЫ:</b>
                </div>
                <div id="actionsStack" style="font-size: 16px; padding: 20px; display: none; background-color: #00000077; color: white; font-weight: bold;">

                </div>

                <button id="applyTestData" style="display: block; margin: 5px auto; border-radius: 12px; font-size: 18px; font-weight: bold; padding: 4px 12px;">
                    ПРИМЕНИТЬ
                </button>
            </div>
`

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

const mapGeneratorDiv = document.getElementById('map-generator')
const mapGeneratorTable = mapGeneratorDiv.querySelector('table')
const mapSizeInput = document.getElementById('map-size')
mapSizeInput.oninput = (e) => resizeMap(e.target.value)

let mapSize = 1
resizeMap(mapSize)

function resizeMap(size) {
    mapSize = (+size <= 0) ? 1 : Math.ceil(+size)
    
    mapGeneratorTable.innerHTML = ''
    for(let y = 0; y < mapSize; y++) {
        const row = document.createElement('tr')
        mapGeneratorTable.append(row)
        for(let x = 0; x < mapSize; x++) {
            const data = document.createElement('td')
            data.innerText = '+'
            data.onclick = (e) => {e.target.innerText = '*'}
            data.oncontextmenu = (e) => {e.preventDefault(); e.target.innerText = '&'}
            row.append(data)
        }
    }
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

        case "Comma" : // <
            actionsStack.innerText = ""
            setCommands({
                commands: [...commands],
                callback: commandsDone,
            })
            commands = []
            break
        case "Period" : // >
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
    alert(result ? 'Задание выполнено' : ' =( В ваших командах была недоработка...')
}
*/