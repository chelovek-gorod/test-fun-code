import { AnimatedSprite, Container, Sprite } from "pixi.js"
import { sprites } from "./engine/loader"
import { BOT_SPEED, DIRECTION, ACTIONS, ITEM_TYPES, CEIL_OFFSET, STONE_SPEED } from "./constants"
import { tickerAdd, tickerRemove } from "./engine/application"
import { EventHub, events, restart } from './engine/events'

export default class Bot extends Container {
    constructor(area, side, inventory) {
        super()
        this.type = ITEM_TYPES.bot

        this.startSide = side

        this.inventory = inventory

        this.shadow = new Sprite( sprites.bot_shadow )
        this.shadow.anchor.set(0.5, 0.9)
        this.shadow.scale.set(0.75)
        this.addChild(this.shadow)

        this.image = new AnimatedSprite(sprites.bot.animations["idle_" + side])
        this.image.anchor.set(0.5, 0.9)
        this.image.scale.set(0.75)
        this.addChild(this.image)

        this.area = area.children

        this.side = side
        this.targetCeil = null
        this.targetX = 0
        this.targetY = 0

        this.speed = BOT_SPEED

        this.commands = []
        this.callback = null

        this.image.animationSpeed = 0.5
        this.image.play()

        EventHub.on( events.setCommands, this.setCommands, this )
    }

    setCommands( data ) {
        if (!("commands" in data) || !("callback" in data)) return
        if (!Array.isArray(data.commands) || data.commands.length === 0) return

        restart()

        this.callback = null // !!! this.idle call callback if callback not null
        this.idle()

        this.commands = data.commands.reverse()
        this.callback = data.callback

        this.checkAction()
    }

    getTurnLeft( isToLeft) {
        switch( this.side ) {
            case DIRECTION.left : return isToLeft ? DIRECTION.down : DIRECTION.up
            case DIRECTION.right : return isToLeft ? DIRECTION.up : DIRECTION.down
            case DIRECTION.up : return isToLeft ? DIRECTION.left : DIRECTION.right
            case DIRECTION.down : return isToLeft ? DIRECTION.right : DIRECTION.left
        }
    }

    getTargetPoint(x, y) {
        const offset = CEIL_OFFSET[this.side]
        if (!offset) return null

        return this.area.find(p => p.x === x + offset.dx && p.y === y + offset.dy)
    }

    idle() {
        restart()

        tickerRemove(this)

        this.position.set(0, 0)
        this.side = this.startSide

        this.speed = BOT_SPEED

        if (this.callback) {
            this.callback(false)
            this.callback = null
        }
        this.commands = []

        this.image.textures = sprites.bot.animations["idle_" + this.side]
        this.image.loop = true
        this.image.play()
    }

    checkAction() {// console.log('get action', this.commands.length ? this.commands[this.commands.length -1] : '[ ]' )
        const action = this.commands.pop()
        if (!action) {
            if(this.parent.item && this.parent.item.type === ITEM_TYPES.target) {
                return this.callback( true )
            }
            return this.idle()
        }

        if (action === ACTIONS.forward) this.useMove()
        else if (action === ACTIONS.use_gun) this.useGun()
        else if (action === ACTIONS.use_key) this.useKey()
        else if (action === ACTIONS.move) this.moveStone()
        else this.useTurn(action)
    }

    /*
    useItem() {
        this.targetCeil = this.getTargetPoint(this.parent.position.x, this.parent.position.y)
        if (!this.targetCeil || !this.targetCeil.item || this.targetCeil.isOpen) return this.idle()

        if (this.targetCeil.item.type === ITEM_TYPES.stone) {
            const ceilAfterStone = this.getTargetPoint(this.targetCeil.x, this.targetCeil.y)

            // check that ceil exist and ceil without any items
            if (!ceilAfterStone || ceilAfterStone.item ) return this.idle()

            this.speed = STONE_SPEED
            this.image.loop = false
            this.image.textures = sprites.bot.animations["start_" + this.side]
            this.image.onComplete = () => {
                this.targetCeil.item.move( this.side, ceilAfterStone )
                this.startMove()
            }
            this.image.gotoAndPlay(0)

            return
        }

        if (this.targetCeil.item.type === ITEM_TYPES.monster) {
            // check gun
            if (!this.inventory.checkItem( ITEM_TYPES.gun )) return this.idle()

            this.targetCeil.item.getShut()

            return setTimeout( () => this.checkAction(), 2000 )
        }

        return this.idle()
    }
    */

    useGun() {
        this.targetCeil = this.getTargetPoint(this.parent.position.x, this.parent.position.y)
        if (!this.targetCeil || !this.targetCeil.item || this.targetCeil.isOpen) return this.idle()

        if (this.targetCeil.item.type === ITEM_TYPES.monster) {
            // check gun
            if (!this.inventory.checkItem( ITEM_TYPES.gun )) return this.idle()

            this.targetCeil.item.getShut()

            return setTimeout( () => this.checkAction(), 1200 )
        }

        return this.idle()
    }

    useKey() {
        // not used now
        return this.idle()
    }

    moveStone() {
        this.targetCeil = this.getTargetPoint(this.parent.position.x, this.parent.position.y)
        if (!this.targetCeil || !this.targetCeil.item || this.targetCeil.isOpen) return this.idle()

        if (this.targetCeil.item.type === ITEM_TYPES.stone) {
            const ceilAfterStone = this.getTargetPoint(this.targetCeil.x, this.targetCeil.y)

            // check that ceil exist and ceil without any items
            if (!ceilAfterStone || ceilAfterStone.item ) return this.idle()

            this.speed = STONE_SPEED
            this.image.loop = false
            this.image.textures = sprites.bot.animations["start_" + this.side]
            this.image.onComplete = () => {
                this.targetCeil.item.move( this.side, ceilAfterStone )
                this.startMove()
            }
            
            return this.image.gotoAndPlay(0)
        }

        return this.idle()
    }

    useTurn(side) {
        const turnSide = this.getTurnLeft( side === DIRECTION.left )
        this.image.textures = sprites.bot.animations[this.side + "_" + turnSide]
        
        this.side = turnSide
        this.image.loop = false
        this.image.gotoAndPlay(0)
        this.image.onComplete = () => this.checkAction()
    }

    useMove() {
        this.targetCeil = this.getTargetPoint(this.parent.position.x, this.parent.position.y)

        if (!this.targetCeil) return this.idle()
        if (!this.targetCeil.checkMove( this.inventory )) return this.idle()

        this.image.loop = false
        this.image.textures = sprites.bot.animations["start_" + this.side]
        this.image.onComplete = this.startMove.bind(this)
        this.image.gotoAndPlay(0)
    }

    startMove() {
        if (CEIL_OFFSET[this.side].dy > 0) {
            this.parent.removeChild(this)
            this.targetCeil.addChild(this)
            this.targetX = 0
            this.targetY = 0
            this.position.set(-CEIL_OFFSET[this.side].dx, -CEIL_OFFSET[this.side].dy)
        } else {
            this.targetX = CEIL_OFFSET[this.side].dx
            this.targetY = CEIL_OFFSET[this.side].dy
        }

        tickerAdd(this)
        // this.image.onComplete = this.checkAction.bind(this)
    }

    endMove() {
        tickerRemove(this)

        this.speed = BOT_SPEED

        if (CEIL_OFFSET[this.side].dy < 0) {
            this.parent.removeChild(this)
            this.targetCeil.addChild(this)
            this.position.set(0, 0)
        }
        
        this.image.textures = sprites.bot.animations["stop_" + this.side]
        this.image.onComplete = this.checkAction.bind(this)
        this.image.gotoAndPlay(0)
    }

    tick(time) {
        switch( this.side ) {
            case DIRECTION.left:
                this.position.x -= this.speed * time.deltaMS
                this.position.y -= this.speed * 0.5 * time.deltaMS
                if (this.position.x <= this.targetX) return this.endMove()
                break
            case DIRECTION.right:
                this.position.x += this.speed * time.deltaMS
                this.position.y += this.speed * 0.5 * time.deltaMS
                if (this.position.x >= this.targetX) return this.endMove()
                break
            case DIRECTION.up:
                this.position.x += this.speed * time.deltaMS
                this.position.y -= this.speed * 0.5 * time.deltaMS
                if (this.position.y <= this.targetY) return this.endMove()
                break
            case DIRECTION.down:
                this.position.x -= this.speed * time.deltaMS
                this.position.y += this.speed * 0.5 * time.deltaMS
                if (this.position.y >= this.targetY) return this.endMove()
                break
        }
    }
}