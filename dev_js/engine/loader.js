import { Assets } from 'pixi.js'
import LoadingBar from './LoadingBar'

const paths = {
    sprites : './sprites/',
    fonts : './fonts/',
}

export const sprites = {
    flag_stem: 'flag_stem.png',
    flag_logo: 'flag_logo.png',
    dpf_flag: 'dpf_flag.png',

    bot_idle: 'bot_idle2.json',

    sbg_1: 'static_bg_m1_00.png',
    sbg_2: 'static_bg_m1_0.png',
    sbg_3: 'static_bg_m1_1.png',
    sbg_4: 'static_bg_m1_2.png',
    sbg_5: 'static_bg_m2_00.png',
    sbg_6: 'static_bg_m2_0.png',
    sbg_7: 'static_bg_m2_1.png',
    sbg_8: 'static_bg_m2_2.png',
    sbg_9: 'static_bg_m3_00.png',
    sbg_10: 'static_bg_m3_0.png',
    sbg_11: 'static_bg_m3_1.png',
    sbg_12: 'static_bg_m3_2.png',
    sbg_13: 'static_bg_m4_00.png',
    sbg_14: 'static_bg_m4_0.png',
    sbg_15: 'static_bg_m4_1.png',
    sbg_16: 'static_bg_m4_2.png',

    bg_1: 'tile_bg_n.png',
    bg_2: 'tile_bg_n0.png',
    bg_3: 'tile_bg_n1.png',
    bg_4: 'tile_bg_n2.png',
    bg_5: 'tile_bg_n3.png',
    bg_6: 'tile_bg_n4.png',

    bg_7: 'tile_bg_m1_00.png',
    bg_8: 'tile_bg_m1_0.png',
    bg_9: 'tile_bg_m1_1.png',
    bg_10: 'tile_bg_m1_2.png',
    bg_11: 'tile_bg_m2_00.png',
    bg_12: 'tile_bg_m2_0.png',
    bg_13: 'tile_bg_m2_1.png',
    bg_14: 'tile_bg_m2_2.png',
    bg_15: 'tile_bg_m3_00.png',
    bg_16: 'tile_bg_m3_0.png',
    bg_17: 'tile_bg_m3_1.png',
    bg_18: 'tile_bg_m3_2.png',
    bg_19: 'tile_bg_m4_00.png',
    bg_20: 'tile_bg_m4_0.png',
    bg_21: 'tile_bg_m4_1.png',
    bg_22: 'tile_bg_m4_2.png',

    bird: 'bird.json',

    clouds: 'clouds.json',
    clouds2: 'clouds2.json',

    inventory_box: 'inventory_box.png',
    light: 'light.json',

    bot: 'bot.json',
    bot_shadow: 'bot_shadow.png',

    ceil_1b: 'ceil_1b.png',
    ceil_1w: 'ceil_1w.png',
    ceil_2b: 'ceil_2b.png',
    ceil_2w: 'ceil_2w.png',
    ceil_3b: 'ceil_3b.png',
    ceil_3w: 'ceil_3w.png',

    door_red: 'door_v_red.json',
    door_green: 'door_v_green.json',
    door_blue: 'door_v_blue.json',
    door_yellow: 'door_v_yellow.json',

    keys:'keys2.json',
    gun:'gun.json',
    monster:'enemy.json',
    explosion: 'explosion.json',
    static_stone: 'stone.png',

    flower: 'flower.json',
}
const spritesNumber = Object.keys(sprites).length
for (let sprite in sprites) sprites[sprite] = paths.sprites + sprites[sprite]

export const fonts = {
    normal: 'Onest-Regular.ttf',
}
for (let font in fonts) fonts[font] = paths.fonts + fonts[font]

///////////////////////////////////////////////////////////////////

export function uploadAssets( loadingDoneCallback ) {
    const assetsNumber = spritesNumber // + soundsNumber + voicesNumber
    let loadedAssets = 0
    let progressPerAsset = 100 / assetsNumber

    const loadingBar = new LoadingBar()

    const multiPacksMap = new Map()
    function updateMultiPackAnimations(sprite, animationsList) {
        // update all textures in all animations at MultiPack atlas
        for(let animationName in sprites[sprite].animations) {
            sprites[sprite].animations[animationName].forEach( (frame, index) => {
                if (!!frame) return // texture is already loaded, go to next frame
                const texture = Assets.cache.get(animationsList[animationName][index])
                sprites[sprite].animations[animationName][index] = texture
            })
        }
    }

    const loading = () => {
        loadedAssets++
        loadingBar.update(progressPerAsset * loadedAssets)
        if (loadedAssets === assetsNumber) {
            multiPacksMap.forEach( (animations, sprite) => updateMultiPackAnimations(sprite, animations) )
            multiPacksMap.clear()
            loadingBar.delete()
            loadingDoneCallback()
        }
    }

    for (let sprite in sprites) {
        Assets.add( {alias: sprite, src: sprites[sprite]} )
        Assets.load( sprite ).then(data => {
            if ('data' in data && 'related_multi_packs' in data.data.meta && 'animations' in data.data) {
                multiPacksMap.set(sprite, data.data.animations)
            }
            sprites[sprite] = data
            loading()
        })
    }
}