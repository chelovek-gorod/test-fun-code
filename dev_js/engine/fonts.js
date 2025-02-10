import { TextStyle } from "pixi.js"
import { fonts } from "./loader"

// https://pixijs.io/pixi-text-style/

export let textStyles = null

export function initFontStyles() {
    // add font family, after update font values in loader
    textStyles = {
        loading: new TextStyle({
            fontFamily: fonts.normal,
            fontSize: 64,
            fill: '#0000ff',
        
            dropShadow: true,
            dropShadowColor: '#777777',
            dropShadowBlur: 4,
            dropShadowAngle: 0,
            dropShadowDistance: 0,
        }),
    }
}