export const CEIL_SIZE = 128
export const CEIL_HALF_SIZE = Math.round(CEIL_SIZE * 0.5)
export const CEIL_QUARTER_SIZE = Math.round(CEIL_HALF_SIZE * 0.5)
export const INVENTORY_CEIL_SIZE = 128
export const MAP_OFFSET_TOP = INVENTORY_CEIL_SIZE + CEIL_SIZE

export const UI_WIDTH = 300
export const ARROW_ANIMATION_DURATION = 200
export const BOT_SPEED = 0.1
export const DIRECTION = {
    left: 'left',
    right: 'right',
    up: 'up',
    down: 'down'
}
export const ACTIONS = {
    left: 'left',
    right: 'right',
    forward: 'forward',
    use: 'use'
}
export const ITEM_TYPES = {
    door: 'door',
    key: 'key',
    target: 'target',
    gun: 'gun',
    enemy: 'enemy',
}
export const KEY_COLORS = {
    red: 'red',
    yellow: 'yellow',
    green: 'green',
    blue: 'blue'
}
export const KEY_COLORS_INDEX = {
    1: KEY_COLORS.red,
    2: KEY_COLORS.yellow,
    3: KEY_COLORS.green,
    4: KEY_COLORS.blue
}