import { EventEmitter } from "pixi.js"

export const EventHub = new EventEmitter()

export const events = {
    screenResize: 'screenResize',
    pointerMove: 'pointerMove',

    setLevel: 'setLevel',
    setCommands: 'setCommands',
    restart: 'restart',

    changeBg: 'changeBg',
    stopBg: 'stopBg',
    showTestBot: 'showTestBot',
}

export function screenResize( data ) {
    EventHub.emit( events.screenResize, data )
}
export function pointerMove( data ) {
    EventHub.emit( events.pointerMove, data )
}

export function setCommands( data ) {
    EventHub.emit( events.setCommands, data )
}
export function setLevel( data ) {
    EventHub.emit( events.setLevel, data )
}
export function restart( ) {
    EventHub.emit( events.restart )
}

export function changeBg( ) {
    EventHub.emit( events.changeBg )
}
export function stopBg( ) {
    EventHub.emit( events.stopBg )
}
export function showTestBot( ) {
    EventHub.emit( events.showTestBot )
}

/*
USAGE

Init:
anyFunction( data )

Subscribe:
EventHub.on( events.eventKey, ( event ) => {
    // event actions 
})

*/