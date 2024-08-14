export const generateUniqueId = () => {
    const timestamp = Date.now().toString(36); // Convert current timestamp to base 36
    const randomStr = Math.random().toString(36).substr(2, 5); // Generate a random string
    return `${timestamp}-${randomStr}`;
}

export const getFirstName = (fullName: string) => fullName.split(" ")[0]

export const getLastName = (fullName: string) => {
    const temp = fullName.split(" ")
    if (temp.length > 2)
        return temp[temp.length - 2]
    else
        return temp[temp.length - 1]
}

export const capitalizeString = (text: string, allWords = false) => {
    if (!text) return ""

    const tempArr = text.split(" ")
    if (tempArr.length < 2 || !allWords) {
        const tempFirstLetter = text.slice(0, 1)
        const tempRestLetter = text.slice(1)
        return tempFirstLetter.toUpperCase() + tempRestLetter
    } else {
        return tempArr.map((word) => {
            const tempFirstLetter = word.slice(0, 1)
            const tempRestLetter = word.slice(1)
            return tempFirstLetter.toUpperCase() + tempRestLetter
        }).join(" ")
    }
}