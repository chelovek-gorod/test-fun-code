import { Container, Sprite, AnimatedSprite, TilingSprite } from "pixi.js"
import { EventHub, events } from './engine/events'
import Bot from "./Bot"
import { getAppScreen, sceneAdd, tickerAdd, tickerRemove } from "./engine/application"
import { sprites } from "./engine/loader"
import { CEIL_SIZE, CEIL_HALF_SIZE, CEIL_QUARTER_SIZE,
    MAP_OFFSET, MAP_OFFSET_TOP, INVENTORY_WIDTH,
    KEY_COLORS_INDEX, ITEM_TYPES, CLOUDS, INVENTORY_CEIL_SIZE }  from "./constants"
import Ceil from "./Ceil"
import Inventory from "./Inventory"
import Door from "./Door"
import Cloud from "./Cloud"
import Stone from "./Stone"
import Monster from "./Monster"
import Item from "./Item"

const game = {}

export function startGame(gameData) {
    const screenData = getAppScreen()

    game.staticBG = new Sprite(sprites.sbg_1)
    game.staticBG.anchor.set(0.5)
    sceneAdd(game.staticBG)

    game.bg = new TilingSprite(sprites.bg_1)
    game.bg.index = 1
    game.bg.tick = (time) => {
        game.bg.tilePosition.x -= 0.004 * time.deltaMS
        game.bg.tilePosition.y += 0.002 * time.deltaMS
    }
    const maxBgIndex = 15
    const tiledBgIndexes = 12
    EventHub.on( events.changeBg, () => {
        game.bg.index++
        if (game.bg.index > maxBgIndex) game.bg.index = 1
        game.bg.texture = sprites['bg_' + game.bg.index]

        if(game.bg.index > tiledBgIndexes) {
            console.log(game.bg.index - tiledBgIndexes)
            game.staticBG.texture = sprites['sbg_' + (game.bg.index - tiledBgIndexes)]
        }
    })
    game.bg.isMove = true
    EventHub.on( events.stopBg, () => {
        game.bg.isMove = !game.bg.isMove
        if (game.bg.isMove) tickerAdd(game.bg)
        else tickerRemove(game.bg)
    })
    tickerAdd(game.bg)
    sceneAdd(game.bg)

    game.mainContainer = new Container()

    game.ceilContainer = new Container()
    game.mainContainer.addChild(game.ceilContainer)

    game.cloudContainer = new Container()
    for(let i = 0; i < CLOUDS.count; i++) {
        game.cloudContainer.addChild( new Cloud( (i % 5) + 1 ) )
    }

    game.inventory = new Inventory(gameData.inventory)
    game.mainContainer.addChild(game.inventory)

    game.sizes = fillGameArea(game.ceilContainer, game.inventory, gameData)
    game.inventory.itemsTargetX = game.sizes.width * 0.5

    EventHub.on( events.screenResize, screenResize )
    screenResize(screenData)

    sceneAdd( game.cloudContainer )
    sceneAdd( game.mainContainer )
}

function screenResize(screenData) { 
    game.staticBG.position.set(screenData.centerX, screenData.centerY)
    game.staticBG.width = screenData.isLandscape ? screenData.width : screenData.height
    game.staticBG.height = screenData.isLandscape ? screenData.width : screenData.height

    game.bg.width = screenData.width
    game.bg.height = screenData.height

    let scale = screenData.width / game.sizes.width
    if (scale > 1) scale = 1
    game.mainContainer.scale.set( scale )
    if (scale === 1) {
        game.mainContainer.position.x = (screenData.width - game.sizes.width * scale) * 0.5
    }

    if (scale > 0.75) game.inventory.scale.set(0.75)
    game.inventory.position.x = game.sizes.width * 0.5
    game.inventory.position.y = MAP_OFFSET * 0.5

    game.cloudContainer.children.forEach( cloud => cloud.setSizes(screenData.width, screenData.height, scale))
}

function fillGameArea(ceils, inventory, gameData) {
    const levelMap =  gameData.map

    // TEST BOT
    let isTestBotOnMap = false

    function changeTestBotImage(testBot) {
        testBot.spriteIndex++
        if (testBot.spriteIndex > 2) testBot.spriteIndex = 1
        testBot.texture = sprites[`bb${testBot.spriteIndex}`]
        setTimeout( changeTestBotImage, Math.ceil( Math.random() * 500 ) + 500, testBot )
    }

    const coordinates = [];
    let maxX = 0
    let maxY = 0
    let isEvenNumberCells = levelMap[0].length % 2 === 0
    let isBright = true
    for (let i = 0; i < levelMap.length; i++) {
        for (let j = 0; j < levelMap[i].length; j++) {
            //Координаты x и y с наклоном влево
            const x = (j - i + (levelMap.length - 1))
            const y = (i + j)
            isBright = !isBright
  
            coordinates.push({ value: levelMap[i][j], x, y, isBright })

            if (maxX < x) maxX = x
            if (maxY < y) maxY = y
        }
        if (isEvenNumberCells) isBright = !isBright
    }

    coordinates.sort( (a, b) => a.y - b.y )
    coordinates.forEach( (point, i) => {
        let ceil = null
        if (point.value > 0) {
            ceil = new Ceil(
                point.x * CEIL_HALF_SIZE + MAP_OFFSET,
                point.y * CEIL_QUARTER_SIZE + MAP_OFFSET_TOP,
                point.isBright
            )
            ceils.addChild(ceil)
        }

        // TEST BOT ANGLE
        if (i === 59 && !isTestBotOnMap) {
            isTestBotOnMap = true
            const testBot = new Sprite(sprites.bb1)
            testBot.spriteIndex = 1
            changeTestBotImage(testBot)
            testBot.anchor.set(0.5, 0.9)
            testBot.scale.set(0.7)
            testBot.alpha = 1
            testBot.position.set(
                point.x * CEIL_HALF_SIZE + MAP_OFFSET,
                point.y * CEIL_QUARTER_SIZE + MAP_OFFSET_TOP,
            )
            game.mainContainer.addChild(testBot)
            EventHub.on(events.showTestBot, () => {
                if (testBot.alpha === 0) testBot.alpha = 1
                else testBot.alpha = 0
            })
        }
        // end test bot 

        switch(point.value) {
            case 2: 
                const bot = new Bot( ceils, gameData.botDirection, inventory )
                ceil.addItem(bot, true)
            break

            case 3:
                const target = new Sprite( sprites.bot_target )
                target.anchor.set(0.5, 0.9)
                target.type = ITEM_TYPES.target
                ceil.addItem(target, true)
            break

            case 41:
            case 42:
            case 43:
            case 44:

            case 51:
            case 52:
            case 53:
            case 54:
                const doorColor = KEY_COLORS_INDEX[(point.value + '')[1]]
                const door = new Door( doorColor, point.value > 50 )
                ceil.addItem(door, true)
            break

            case 61:
            case 62:
            case 63:
            case 64:
                const keyColor = KEY_COLORS_INDEX[(point.value + '')[1]]
                const key = new Item( {
                    type: ITEM_TYPES.key,
                    color: keyColor,
                })
                ceil.addItem(key, true)
            break

            case 7:
                ceil.addItem( new Item( { type: ITEM_TYPES.gun }), true )
            break

            case 8:
                ceil.addItem(new Stone(), true)
            break

            case 91:
            case 92:
                const monsterSide = +((point.value + '')[1])
                const monster = new Monster( monsterSide )
                ceil.addItem(monster, true)
            break
        }
    })
    
    return ({
        width: maxX * CEIL_HALF_SIZE + MAP_OFFSET * 2,
        height: maxY * CEIL_QUARTER_SIZE + MAP_OFFSET + MAP_OFFSET_TOP
    })
}