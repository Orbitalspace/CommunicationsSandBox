import hexdump
import struct
import time
import socket

# Decoding adapted from https://gist.github.com/mumrah/8fe7597edde50855211e27192cce9f88 with modifications

def decode_addr(data, cursor):
    (a1, a2, a3, a4, a5, a6, a7) = struct.unpack("<BBBBBBB", data[cursor:cursor+7])
    hrr = a7 >> 5
    ssid = (a7 >> 1) & 0xf     
    ext = a7 & 0x1

    addr = struct.pack("<BBBBBB", a1 >> 1, a2 >> 1, a3 >> 1, a4 >> 1, a5 >> 1, a6 >> 1)
    if ssid != 0:
      call = "{}-{}".format(addr.strip(), ssid)
    else:
      call = addr
    return (call, hrr, ext)

def decode_uframe(ctrl, data, pos):
    print ("U Frame")
    if ctrl == 0x3:
        # UI frame
        (pid,) = struct.unpack("<B", data[pos])
        pos += 1
        rem = len(data[pos:-2])
        info = struct.unpack("<" + "B"*rem, data[pos:-2])
        pos += rem
        fcs = struct.unpack("<BB", data[pos:])
        print ("INFO: " + struct.pack("<" + "B"*len(info), *info))
         

def decode_sframe(ctrl, data, pos):
    print ("S Frame")

def decode_iframe(ctrl, data, pos):
    print ("I Frame")

def p(frame):
    pos = 0
    what_is_this = struct.unpack("<B", bytes([frame[pos]]))
    pos += 1

    # DST
    (dest_addr, dest_hrr, dest_ext) = decode_addr(frame, pos)
    pos += 7
    print(dest_addr)
    print ("DST: " + dest_addr.decode())
    
    # SRC
    (src_addr, src_hrr, src_ext) = decode_addr(frame, pos)  
    pos += 7
    print ("SRC: " + src_addr.decode())
    
    # REPEATERS
    ext = src_ext
    while ext == 0:
        rpt_addr, rpt_hrr, ext = decode_addr(frame, pos)
        print ("RPT: " + rpt_addr)
        pos += 7

    # CTRL
    (ctrl,) = struct.unpack("<B", bytes([frame[pos]]))
    pos += 1
  
    print (ctrl)

    if (ctrl & 0x3) == 0x3:
        decode_uframe(ctrl, frame, pos)
    elif (ctrl & 0x3) == 0x1:
        decode_sframe(ctrl, frame, pos)
    elif (ctrl & 0x1) == 0x0:
        decode_iframe(ctrl, frame, pos)

    print(hexdump.hexdump(frame))


# creating a socket object
s = socket.socket(socket.AF_INET,
                  socket.SOCK_STREAM)

# get local Host machine name
host = '' # or just use (host == '')
port = 8002

# bind to pot
s.bind((host, port))

# Que up to 5 requests
s.listen(1)

while True:
    # establish connection
    clientSocket, addr = s.accept()
    print("got a connection from %s" % str(addr))
    data = clientSocket.recv(1024)
    p(data)
    clientSocket.close()
