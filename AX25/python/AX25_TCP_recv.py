from ax25_decoder import ax25decode
import socket

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
    ax25decode(data)
    clientSocket.close()
