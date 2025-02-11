import { Container, Sprite, AnimatedSprite, TilingSprite } from "pixi.js"
import { EventHub, events } from './engine/events'
import Bot from "./Bot"
import { getAppScreen, sceneAdd } from "./engine/application"
import { sprites } from "./engine/loader"
import { CEIL_SIZE, CEIL_HALF_SIZE, CEIL_QUARTER_SIZE, MAP_OFFSET_TOP, KEY_COLORS_INDEX, ITEM_TYPES }  from "./constants"
import Ceil from "./Ceil"
import Inventory from "./Inventory"
import Door from "./Door"
import Cloud from "./Cloud"

const game = {}

export function startGame(gameData) {
    const screenData = getAppScreen()

    game.bg = new TilingSprite(sprites.bg_1)
    sceneAdd(game.bg)

    game.mainContainer = new Container()

    game.ceilContainer = new Container()
    game.mainContainer.addChild(game.ceilContainer)

    game.cloudContainer = new Container()
    for(let i = 0; i < 50; i++) game.cloudContainer.addChild( new Cloud( (i % 5) + 1 ) )

    game.objectContainer = new Container()
    game.mainContainer.addChild(game.objectContainer)

    game.inventory = new Inventory(gameData.inventory)
    game.mainContainer.addChild(game.inventory)

    game.sizes = fillGameArea(game.ceilContainer, game.objectContainer, game.inventory, gameData)
    game.inventory.itemsTargetX = game.sizes.width * 0.5

    EventHub.on( events.screenResize, screenResize )
    screenResize(screenData)

    sceneAdd( game.cloudContainer )
    sceneAdd( game.mainContainer )
}

function screenResize(screenData) { 
    game.bg.width = screenData.width
    game.bg.height = screenData.height

    let scale = screenData.width / game.sizes.width
    if (scale > 1) scale = 1
    game.mainContainer.scale.set( scale )
    if (scale === 1) {
        game.mainContainer.position.x = (screenData.width - game.sizes.width * scale) * 0.5
    }

    game.inventory.position.y = CEIL_HALF_SIZE * scale
    game.inventory.position.x = (game.sizes.width - game.inventory.width) * 0.5

    game.cloudContainer.children.forEach( cloud => cloud.setSizes(screenData.width, screenData.height, scale))
}

function fillGameArea(ceils, objects, inventory, gameData) {
    const levelMap =  gameData.map

    const coordinates = [];
    let maxX = 0
    let maxY = 0
    for (let i = 0; i < levelMap.length; i++) {
        for (let j = 0; j < levelMap[i].length; j++) {
            //Координаты x и y с наклоном влево
            const x = (j - i + (levelMap.length - 1))
            const y = (i + j)
            coordinates.push({ value: levelMap[i][j], x, y })
            if (maxX < x) maxX = x
            if (maxY < y) maxY = y
        }
    }

    let targetX, targetY, bot

    coordinates.sort( (a, b) => a.y - b.y )
    coordinates.forEach( point => {
        switch(point.value) {
            case 1:
                ceils.addChild(
                    new Ceil(
                        point.x * CEIL_HALF_SIZE + CEIL_SIZE,
                        point.y * CEIL_QUARTER_SIZE + CEIL_SIZE + MAP_OFFSET_TOP
                    )
                )
            break
            
            case 2:
                bot = new Bot(
                    point.x * CEIL_HALF_SIZE + CEIL_SIZE,
                    point.y * CEIL_QUARTER_SIZE + CEIL_SIZE + MAP_OFFSET_TOP
                    , ceils, gameData.botDirection, inventory
                )
                objects.addChild( bot )

                ceils.addChild(
                    new Ceil(
                        point.x * CEIL_HALF_SIZE + CEIL_SIZE,
                        point.y * CEIL_QUARTER_SIZE + CEIL_SIZE + MAP_OFFSET_TOP
                    )
                )
            break

            case 3:
                const target = new Sprite( sprites.bot_target )
                target.anchor.set(0.5, 0.9)
                target.type = ITEM_TYPES.target

                targetX = point.x * CEIL_HALF_SIZE + CEIL_SIZE
                targetY = point.y * CEIL_QUARTER_SIZE + CEIL_SIZE + MAP_OFFSET_TOP

                ceils.addChild( new Ceil( targetX, targetY, true, target ) )
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

                ceils.addChild(
                    new Ceil(
                        point.x * CEIL_HALF_SIZE + CEIL_SIZE,
                        point.y * CEIL_QUARTER_SIZE + CEIL_SIZE + MAP_OFFSET_TOP,
                        false, door
                    )
                )
            break

            case 61:
            case 62:
            case 63:
            case 64:
                const keyColor = KEY_COLORS_INDEX[(point.value + '')[1]]
                const key = new AnimatedSprite( sprites.keys.animations[ keyColor ] )
                key.anchor.set(0.5, 0.7)
                key.gotoAndPlay( Math.floor( Math.random() * key.textures.length ) )
                key.type = ITEM_TYPES.key
                key.color = keyColor

                ceils.addChild(
                    new Ceil(
                        point.x * CEIL_HALF_SIZE + CEIL_SIZE,
                        point.y * CEIL_QUARTER_SIZE + CEIL_SIZE + MAP_OFFSET_TOP,
                        false, key
                    )
                )
            break
        }
    })

    bot.setTargetPoint( targetX, targetY )
    
    return ({
        width: maxX * CEIL_HALF_SIZE + CEIL_SIZE * 2,
        height: maxY * CEIL_QUARTER_SIZE + CEIL_SIZE * 2 + MAP_OFFSET_TOP
    })
}