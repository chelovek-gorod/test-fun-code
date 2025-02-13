import { Container, Sprite, AnimatedSprite, TilingSprite } from "pixi.js"
import { EventHub, events } from './engine/events'
import Bot from "./Bot"
import { getAppScreen, sceneAdd } from "./engine/application"
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

    game.bg = new TilingSprite(sprites.bg_1)
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
    coordinates.forEach( point => {
        switch(point.value) {
            case 1:
                ceils.addChild(
                    new Ceil(
                        point.x * CEIL_HALF_SIZE + MAP_OFFSET,
                        point.y * CEIL_QUARTER_SIZE + MAP_OFFSET_TOP,
                        point.isBright
                    )
                )
            break
            
            case 2:
                const bot = new Bot( ceils, gameData.botDirection, inventory )

                ceils.addChild(
                    new Ceil(
                        point.x * CEIL_HALF_SIZE + MAP_OFFSET,
                        point.y * CEIL_QUARTER_SIZE + MAP_OFFSET_TOP,
                        point.isBright, bot
                    )
                )
            break

            case 3:
                const target = new Sprite( sprites.bot_target )
                target.anchor.set(0.5, 0.9)
                target.type = ITEM_TYPES.target

                ceils.addChild(
                    new Ceil(
                        point.x * CEIL_HALF_SIZE + MAP_OFFSET,
                        point.y * CEIL_QUARTER_SIZE + MAP_OFFSET_TOP,
                        point.isBright, target
                    )
                )
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
                        point.x * CEIL_HALF_SIZE + MAP_OFFSET,
                        point.y * CEIL_QUARTER_SIZE + MAP_OFFSET_TOP,
                        point.isBright, door
                    )
                )
            break

            case 61:
            case 62:
            case 63:
            case 64:
                const keyColor = KEY_COLORS_INDEX[(point.value + '')[1]]
                const key = new Item( {
                    type: ITEM_TYPES.key,
                    color: keyColor,
                    textures: sprites.keys.animations[ keyColor ]
                })

                ceils.addChild(
                    new Ceil(
                        point.x * CEIL_HALF_SIZE + MAP_OFFSET,
                        point.y * CEIL_QUARTER_SIZE + MAP_OFFSET_TOP,
                        point.isBright, key
                    )
                )
            break

            case 7:
                const gun = new Item( {
                    type: ITEM_TYPES.gun,
                    textures: sprites.gun.animations.gun
                })

                ceils.addChild(
                    new Ceil(
                        point.x * CEIL_HALF_SIZE + MAP_OFFSET,
                        point.y * CEIL_QUARTER_SIZE + MAP_OFFSET_TOP,
                        point.isBright, gun
                    )
                )
            break

            case 8:
                const stone = new Stone()
                ceils.addChild( 
                    new Ceil(
                        point.x * CEIL_HALF_SIZE + MAP_OFFSET,
                        point.y * CEIL_QUARTER_SIZE + MAP_OFFSET_TOP,
                        point.isBright, stone
                    )
                )
            break

            case 91:
            case 92:
                const monsterSide = +((point.value + '')[1])
                const monster = new Monster( monsterSide )

                ceils.addChild(
                    new Ceil(
                        point.x * CEIL_HALF_SIZE + MAP_OFFSET,
                        point.y * CEIL_QUARTER_SIZE + MAP_OFFSET_TOP,
                        point.isBright, monster
                    )
                )
            break
        }
    })
    
    return ({
        width: maxX * CEIL_HALF_SIZE + MAP_OFFSET * 2,
        height: maxY * CEIL_QUARTER_SIZE + MAP_OFFSET + MAP_OFFSET_TOP
    })
}