const listenHost = '127.0.0.1'
const listenPort = 8001
const fileName = '.\\received.packet'

/**
 * Listens for Frame and saves it to file
 * @function listenForFrame
 * @param {string} host Host url to listen to.
 * @param {number} port Port number to listen to.
 */
function listenForFrame(host, port) {
    const net = require('net')
    const server = net.createServer()
    const fs = require('fs')
    server.listen(port, host)
    server.on('connection', function (socket) {
        socket.on('data', (buffer) => {
            fs.writeFile(fileName, buffer, (err) => {
                if (err) console.log(err)
            });
            // Convert back to array.
            // const packet = [...buffer]
        })
    });
}
/**
 * Main Function
 */
(() => {
    listenForFrame(listenHost, listenPort)
})()