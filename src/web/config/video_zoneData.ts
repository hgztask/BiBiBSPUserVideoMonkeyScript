import video_zone from './video_zone.json'

type VideoZoneData = Record<string, string[]>

const findKey = (itemKey: string): string | null => {
    for (const key in video_zone as VideoZoneData) {
        const arr: string[] = (video_zone as VideoZoneData)[key]
        if (arr.some((i) => i === itemKey)) return key
    }
    return null
}

export default {findKey}
