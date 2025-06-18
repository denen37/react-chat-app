export const getInitials = (name) => {
    return name?.split(' ').map((word) => word[0]).join('').toUpperCase();
}

export const findTime = (time) => {
    const diff = new Date() - new Date(time)
    const timeMap = [
        { unit: 'd', value: 24 * 60 * 60 * 1000 },
        { unit: 'h', value: 60 * 60 * 1000 },
        { unit: 'm', value: 60 * 1000 },
        { unit: 's', value: 1000 },
        { unit: 'ms', value: 1 }
    ]

    let timeObj = timeMap.find(item => {
        return (Math.abs(diff) / item.value) >= 1
    })


    return timeObj.unit == 'ms' ? 'just now' : Math.floor(diff / timeObj.value) + timeObj.unit + ' ago'
}