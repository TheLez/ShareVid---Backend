const createAccount = () => {
    return new Promise((resolve, reject) => {
        try {
            resolve({})
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    createAccount
}