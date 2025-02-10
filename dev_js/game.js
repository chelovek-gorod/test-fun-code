import { Container, Sprite, TilingSprite } from "pixi.js"
import { EventHub, events, setCommands } from './engine/events'
import Bot from "./Bot"
import { getAppScreen, sceneAdd, tickerAdd } from "./engine/application"
import { sprites } from "./engine/loader"
import { CEIL_SIZE, CEIL_HALF_SIZE, CEIL_QUARTER_SIZE, BACKGROUND_SPEED, ARROW }  from "./constants"

/*
const level = [
    "..................*-*..................",
    "...............*-*[ ]*-*...............",
    "............*-*[ ][ ][ ]*-*............",
    ".........*-*[ ][ ]*-*[ ][ ]*-*.........",
    "......*-*[ ][ ][ ]*-*[ ][ ][ ]*-*......",
    "...*-*[ ][ ]*-*[ ]*-*[ ]*-*[ ][ ]*-*...",
    "*-*[ ][ ]*-**-*[ ][B][ ]*-**-*[ ][ ]*-*",
    "...*-*[ ][ ]*-*[ ]*-*[ ]*-*[ ][ ]*-*...",
    "......*-*[ ][ ][ ]*-*[ ][ ][ ]*-*......",
    ".........*-*[ ][ ]*-*[ ][ ]*-*.........",
    "............*-*[ ][ ][ ]*-*............",
    "...............*-*[ ]*-*...............",
    "..................*-*..................",
]


level = [
    ":..::..::..::..:<  >:..::..::..::..:",
    ":..::..::..::.<  ><  >.::..::..::..:",
    ":..::..::..:<  >:..:<  >:..::..::..:",
    ":..::..::.<  >.::..::.<  >.::..::..:",
    ":..::..:<  >:..::..::..:<  >:..::..:",
    ":..::.<  ><  >.::..::.<  ><  >.::..:",
    ":..:<  >:..:<  >:..:<  >:..:<  >:..:",
    ":.<  >.::..::.<  ><  >.::..::.<  >.:",
    "<  >:..::..::..:<Bt>:..::..::..:<  >",
    ":.<  >.::..::.<  ><  >.::..::.<  >.:",
    ":..:<  >:..:<  >:..:<  >:..:<  >:..:",
    ":..::.<  ><  >.::..::.<  ><  >.::..:",
    ":..::..:<  >:..::..::..:<  >:..::..:",
    ":..::..::.<  >.::..::.<  >.::..::..:",
    ":..::..::..:<  >:..:<  >:..::..::..:",
    ":..::..::..::.<  ><  >.::..::..::..:",
    ":..::..::..::..:<  >:..::..::..::..:",
]
*/

/*
     \
     _\|
*/
const level = [
    [0, 0, 1, 1, 1, 0, 0, 1, 0],
    [1, 1, 1, 0, 1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 0, 0, 0],
    [3, 0, 1, 1, 0, 0, 1, 1, 1],
    [0, 0, 1, 1, 0, 0, 1, 2, 1],
    [0, 0, 0, 1, 1, 1, 1, 1, 1],
]

const gameObjects = {}

export function startGame() {

    const screenData = getAppScreen()

    gameObjects.bg = new TilingSprite(sprites.bg_1)
    gameObjects.bg.tick = (time) => gameObjects.bg.tilePosition.y += BACKGROUND_SPEED * time.deltaMS
    tickerAdd(gameObjects.bg)
    sceneAdd(gameObjects.bg)

    gameObjects.gameContainer = new Container()

    gameObjects.ceils = new Container()
    gameObjects.gameContainer.addChild(gameObjects.ceils)

    gameObjects.units = new Container()
    gameObjects.gameContainer.addChild(gameObjects.units)

    gameObjects.sizes = fillGameArea(gameObjects.ceils, gameObjects.units, level)
    sceneAdd( gameObjects.gameContainer )

    EventHub.on( events.screenResize, screenResize )

    screenResize(screenData)
}

function screenResize(screenData) { 
    gameObjects.bg.width = screenData.width
    gameObjects.bg.height = screenData.height

    console.log()

    let scale = screenData.width / gameObjects.sizes.width
    if (scale > 1) scale = 1
    gameObjects.gameContainer.scale.set( scale )
}

function fillGameArea(ceils, units, level) {

    const coordinates = [];
    let maxX = 0
    let maxY = 0
    for (let i = 0; i < level.length; i++) {
        for (let j = 0; j < level[i].length; j++) {
            const x = j - i + (level.length - 1) // Новая координата x с наклоном влево
            const y = i + j + 4 // Новая координата y
            coordinates.push({ value: level[i][j], x, y })
            if (maxX < x) maxX = x + 1
            if (maxY < y) maxY = y
        }
    }

    coordinates.sort( (a, b) => a.y - b.y )
    coordinates.forEach( point => {
        switch(point.value) {
            case 1:
                const ceil = new Sprite( sprites.ceil )
                ceil.anchor.set(0.5, 0.25)
                ceil.position.set(
                    Math.round(point.x * CEIL_HALF_SIZE),
                    Math.round(point.y * CEIL_QUARTER_SIZE)
                )
                ceils.addChild( ceil )
                break;
            
            case 2:
                const ceilBot = new Sprite( sprites.ceil )
                ceilBot.anchor.set(0.5, 0.25)
                ceilBot.position.set(
                    Math.round(point.x * CEIL_HALF_SIZE),
                    Math.round(point.y * CEIL_QUARTER_SIZE)
                )
                ceils.addChild( ceilBot )

                gameObjects.bot = new Bot(
                    Math.round(point.x * CEIL_HALF_SIZE),
                    Math.round(point.y * CEIL_QUARTER_SIZE),
                    ceils
                )
                units.addChild( gameObjects.bot )
                break;

            case 3:
                const ceilTarget = new Sprite( sprites.ceil )
                ceilTarget.anchor.set(0.5, 0.25)
                ceilTarget.position.set(
                    Math.round(point.x * CEIL_HALF_SIZE),
                    Math.round(point.y * CEIL_QUARTER_SIZE)
                )
                ceils.addChild( ceilTarget )

                gameObjects.target = new Sprite( sprites.bot_target )
                gameObjects.target.anchor.set(0.5, 0.9)
                gameObjects.target.position.set(
                    Math.round(point.x * CEIL_HALF_SIZE),
                    Math.round(point.y * CEIL_QUARTER_SIZE)
                )
                units.addChild( gameObjects.target )
                break;
        }
    })

    gameObjects.bot.setTargetPoint( gameObjects.target.position.x, gameObjects.target.position.y )

    return ({
        width: Math.round(maxX * CEIL_HALF_SIZE),
        height: Math.round(maxY * CEIL_QUARTER_SIZE)
    })
}

//////////////////////////////////////////////
let commands = [] 
document.addEventListener('keydown', (key) => {
    switch(key.code) {
        case "ArrowUp":
            commands.push(ARROW.forward)
            console.log(commands)
            break

        case "ArrowLeft":
            commands.push(ARROW.left)
            console.log(commands)
            break

        case "ArrowRight":
            commands.push(ARROW.right)
            console.log(commands)
            break

        case "Space":
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
