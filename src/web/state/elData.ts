type ElDataValue = string | boolean | number | any[] | Map<any, any> | Record<string, any> | null

const getData = (key: string, defValue: ElDataValue = null): ElDataValue => {
    const el = document.querySelector('#mk_data')
    if (el === null) {
        return defValue
    }
    const text = el.textContent?.trim() ?? ''
    const parse = JSON.parse(text) as Record<string, ElDataValue>
    if (parse[key]) {
        return parse[key]
    }
    return defValue
}

const addData = (key: string, value: string | number | boolean): void => {
    const el = document.querySelector('#mk_data')
    if (el === null) {
        const mk_data = document.createElement('div')
        mk_data.id = 'mk_data'
        mk_data.style.display = 'none'
        document.head.appendChild(mk_data)
        mk_data.textContent = JSON.stringify({[key]: value})
        return
    }
    const txt = el.textContent?.trim() ?? ''
    const parse = JSON.parse(txt) as Record<string, string | number | boolean>
    parse[key] = value
    el.textContent = JSON.stringify(parse)
}

const setData = (key: string, value: string | number | boolean): void => {
    addData(key, value)
}

export default {
    addData,
    getData,
    setData
}
