import { AnimatedSprite, Container, Sprite } from "pixi.js"
import { sprites } from "./engine/loader"
import { BOT_SPEED, CEIL_SIZE, DIRECTION, ARROW, CEIL_HALF_SIZE, CEIL_QUARTER_SIZE } from "./constants"
import { tickerAdd, tickerRemove } from "./engine/application"
import { EventHub, events } from './engine/events'

export default class Bot extends Container {
    constructor(x, y, area, side = DIRECTION.down) {
        super()

        this.startX = x
        this.startY = y
        this.startSide = side

        this.globalTargetX = 0
        this.globalTargetY = 0

        this.shadow = new Sprite( sprites.bot_shadow )
        this.shadow.anchor.set(0.5, 0.9)
        this.shadow.scale.set(0.75)
        this.addChild(this.shadow)

        this.image = new AnimatedSprite(sprites.bot.animations["idle_" + side])
        this.image.anchor.set(0.5, 0.9)
        this.image.scale.set(0.75)
        this.addChild(this.image)

        this.position.set(x, y)

        this.area = area.children

        this.side = side
        this.targetPoint = null

        this.commands = []
        this.callback = null

        this.image.animationSpeed = 0.5
        this.image.play()

        EventHub.on( events.setCommands, this.setCommands, this )
    }

    setTargetPoint( x, y ) {
        this.globalTargetX = x
        this.globalTargetY = y
    }

    setCommands( data ) {
        if (!("commands" in data) || !("callback" in data)) return
        if (data.commands.length === 0) return

        this.commands = data.commands.reverse()
        this.callback = data.callback

        this.position.set(this.startX, this.startY)

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

    getTargetPoint() {
        switch( this.side ) {
            case DIRECTION.left:
                return (
                    this.area.find(
                        p => p.x === this.x - CEIL_HALF_SIZE && p.y === this.y - CEIL_QUARTER_SIZE
                    )
                )
            case DIRECTION.right:
                return (
                    this.area.find(
                        p => p.x === this.x + CEIL_HALF_SIZE && p.y === this.y + CEIL_QUARTER_SIZE
                    )
                )
            case DIRECTION.up:
                return (
                    this.area.find(
                        p => p.x === this.x + CEIL_HALF_SIZE && p.y === this.y - CEIL_QUARTER_SIZE
                    )
                )
            case DIRECTION.down:
                return (
                    this.area.find(
                        p => p.x === this.x - CEIL_HALF_SIZE && p.y === this.y + CEIL_QUARTER_SIZE
                    )
                )
        }
    }

    idle() {
        this.position.set(this.startX, this.startY)
        this.side = this.startSide

        this.callback = null
        this.commands = []

        this.image.textures = sprites.bot.animations["idle_" + this.side]
        this.image.loop = true
        this.image.play()
    }

    checkAction() {
        const action = this.commands.pop()

        if (!action) return this.checkWin()

        if (action === ARROW.forward) this.useMove()
        else this.useTurn(action)
    }

    checkWin() {
        if (this.x === this.globalTargetX
        && this.y === this.globalTargetY
        && this.callback) return this.callback(true)

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
        this.targetPoint = this.getTargetPoint()
        console.log('this.targetPoint', this.x, this.y, this.area)
        if (!this.targetPoint) {
            this.callback(false)
            this.idle()
        } else {
            this.image.loop = false
            this.image.textures = sprites.bot.animations["start_" + this.side]
            this.image.onComplete = this.startMove.bind(this)
            this.image.gotoAndPlay(0)
        }
    }

    startMove() {
        tickerAdd(this)
        this.image.onComplete = this.checkAction.bind(this)
    }

    endMove() {
        tickerRemove(this)
        this.position.set(this.targetPoint.x, this.targetPoint.y)
        this.image.textures = sprites.bot.animations["stop_" + this.side]
        this.image.onComplete = this.checkAction.bind(this)
        this.image.gotoAndPlay(0)
    }

    tick(time) {
        switch( this.side ) {
            case DIRECTION.left:
                this.position.x -= BOT_SPEED * time.deltaMS
                this.position.y -= BOT_SPEED * 0.5 * time.deltaMS
                if (this.position.x <= this.targetPoint.x) return this.endMove()
                break
            case DIRECTION.right:
                this.position.x += BOT_SPEED * time.deltaMS
                this.position.y += BOT_SPEED * 0.5 * time.deltaMS
                if (this.position.x >= this.targetPoint.x) return this.endMove()
                break
            case DIRECTION.up:
                this.position.x += BOT_SPEED * time.deltaMS
                this.position.y -= BOT_SPEED * 0.5 * time.deltaMS
                if (this.position.y <= this.targetPoint.y) return this.endMove()
                break
            case DIRECTION.down:
                this.position.x -= BOT_SPEED * time.deltaMS
                this.position.y += BOT_SPEED * 0.5 * time.deltaMS
                if (this.position.y >= this.targetPoint.y) return this.endMove()
                break
        }
    }
}