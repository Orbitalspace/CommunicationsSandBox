// Based on https://thomask.sdf.org/blog/2018/12/15/sending-raw-ax25-python.html
const nodePath = process.argv[0]
const jsPath = process.argv[1]
const sourceCallSign = process.argv[2]
const destinationCallSign = process.argv[3]
const message = process.argv[4]
const listenerHost = '127.0.0.1'
const listenerPort = 8001
// https://www.ka9q.net/papers/kiss.html
// https://www.tapr.org/pdf/AX25.2.2.pdf
const KISS_FEND = 0xC0 // Frame start/end marker.
const KISS_FESC = 0xDB // Escape character.
const KISS_TFEND = 0xDC // If after an escape, means there was an 0xC0 in the source message.
const KISS_TFESC = 0xDD // If after an escape, means there was an 0xDB in the source message.
const KISS_CMD = 0x00 // Two nybbles combined - TNC 0, command 0 (send data).
const C_BYTE = 0x03 // This is a UI frame.
const PID = 0xF0 // No protocol.

if (process.argv.length != 5 || !sourceCallSign || !destinationCallSign || !message) {
    console.log(`Usage ${jsPath} <source callsign> <destination callsign> <message>`)
    return
}

/**
 * Encodes call sign address.
 * Addresses must be 6 bytes plus the SSID byte, each character shifted left by 1.
 * If it's the final address in the header, set the low bit to 1.
 * Ignoring command/response for simple example.
 * @function encodeAddress
 * @param {string} callSign Target call sign for encoding.
 * @param {boolean} final Defines if low bit should be 1.
 * @returns {Array} Encoded call sign.
 */
function encodeAddress(callSign, final) {
    if (callSign.indexOf('-') === -1) callSign += '-0' // default to SSID 0
    const [call, ssid] = callSign.split('-')
    if (call.length < 6) call = call + ' '.repeat(6 - call.length) // Pad short call signs with spaces
    const encodedCall = []
    for (character of call.substr(0, 6)) encodedCall.push(character.charCodeAt(0) << 1)
    const encodedSSID = (parseInt(ssid) << 1) | 0b01100000 | (final ? 0b00000001 : 0)
    return encodedCall.concat(encodedSSID)
}
/**
 * Assembles unescaped raw packet. 
 * Make a UI frame by concatenating the parts together.
 * This is just an array of ints representing bytes at this point.
 * @function assembleRawPacket
 * @param {string} sourceCallSign Call sign of the source.
 * @param {string} destinationCallSign Call sign of the destination.
 * @param {string} message Message payload.
 * @returns {Array} Raw unescaped packet.
 */
function assembleRawPacket(sourceCallSign, destinationCallSign, message) {
    const sourceAddress = encodeAddress(sourceCallSign.toUpperCase(), true)
    const destinationAddress = encodeAddress(destinationCallSign.toUpperCase(), false)
    const encodedMessage = []
    for (character of message) encodedMessage.push(character.charCodeAt(0))
    const rawPacket = destinationAddress
        .concat(sourceAddress)
        .concat([C_BYTE, PID])
        .concat(encodedMessage)
    return rawPacket
}

/**
 * Escape the packet in case either KISS_FEND or KISS_FESC ended up in our stream.
 * @function escapePacket
 * @param {Array} packet Unescaped raw packet.
 * @returns {Array} Escaped packet.
 */
function escapePacket(packet) {
    const escapedPacket = []
    for (x of packet) {
        if (x === KISS_FEND) {
            escapedPacket.push(KISS_FESC)
            escapedPacket.push(KISS_TFEND)
        } else if (x === KISS_FESC) {
            escapedPacket.push(KISS_FESC)
            escapedPacket.push(KISS_TFESC)
        }
        else escapedPacket.push(x)
    }
    return escapedPacket
}

/**
 * Wrap packet according to the KISS spec.
 * @function wrapKissFrameOnPacket
 * @param {Array} packet Target packet.
 * @returns {Array} Frame.
 */
function wrapKissFrameOnPacket(packet) {
    const kissFrame = [KISS_FEND, KISS_CMD]
        .concat(packet)
        .concat([KISS_FEND])
    return kissFrame
}

/**
 * Send the frame buffer to the a packet listener on the port given.
 * @function sendFrame
 * @param {Buffer} frameBuffer - Buffer to be sent.
 * @param {string} host host of listener.
 * @param {number} port port of listener.
 */
function sendFrame(frameBuffer, host, port) {
    const net = require('net')
    const socket = net.Socket()
    socket.connect(port, host)
        .end(frameBuffer)
}

/**
 * Main function
 * Assemble then escape packet then wrap packet with KISS frame then create buffer then send frame to packet listener.
 */
(() => {
    sendFrame(Buffer.from(wrapKissFrameOnPacket(escapePacket(assembleRawPacket(sourceCallSign, destinationCallSign, message)))), listenerHost, listenerPort)
})()
// OR the equivelant readable version below.
// (() => {
//     const rawPacket = assembleRawPacket(sourceCallSign, destinationCallSign, message)
//     const escapedPacket = escapePacket(rawPacket)
//     // Build the frame that we will send to Dire Wolf and turn it into a string
//     const kissFrame = wrapKissFrameOnPacket(escapedPacket)
//     const frameBuffer = Buffer.from(kissFrame)
//     // Connect to Dire Wolf listening on port 8001 on this machine and send the frame
//     sendFrame(frameBuffer, listenerHost, listenerPort)
// })()