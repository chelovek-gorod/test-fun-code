import { Container, Graphics, Text } from 'pixi.js'
import { textStyles } from './fonts'
import { getAppScreen, sceneAdd, sceneRemove } from './application'
import { EventHub, events } from './events'

const settings = {
    width: 270,
    height: 90,
}
settings.halfWidth = settings.width / 2
settings.halfHeight = settings.height / 2
settings.sidePoints = 100 / 8 // 12.5% in half side
settings.stepH = settings.halfWidth / settings.sidePoints
settings.stepV = settings.halfHeight / settings.sidePoints

class LoadingBar extends Container {
    constructor() {
        super()

        this.text = new Text({
            text:'0%',
            style:textStyles.loading
          })
        this.text.anchor.set(0.5, 1)
        this.text.position.y = 10
        this.addChild(this.text)

        this.screenResize( getAppScreen() )
        //EventHub.on( events.screenResize, this.screenResize.bind(this) )

        sceneAdd(this)
    }

    delete() {
        this.removeAllListeners()
        sceneRemove(this)
        this.destroy()
    }

    screenResize(screenData) {
       // if (this.destroyed) return
        this.position.x = screenData.centerX
        this.position.y = screenData.centerY
    }

    update(progress) {
        const range = Math.round(progress)
        this.text.text = range + '%'
    }
}

export default LoadingBar