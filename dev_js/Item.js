import { AnimatedSprite } from "pixi.js"
import { EventHub, events } from './engine/events'

export default class Item extends AnimatedSprite {
    // itemData = {type, color, textures}
    constructor(itemData, isCollected = false) {
        super(itemData.textures)
        this.anchor.set(0.5, isCollected ? 0.5 : 0.7)
        this.gotoAndPlay( Math.floor( Math.random() * this.textures.length ) )
        this.type = itemData.type
        if ("color" in itemData) this.color = itemData.color

        this.isCollectedOnRestart = isCollected

        EventHub.on( events.restart, this.restart, this )
    }

    restart() {
        this.anchor.set(0.5, this.isCollectedOnRestart ? 0.5 : 0.7)
    }
}