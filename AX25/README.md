
# AX.25
## DireWolf
Run `./direwolf/direwolf.exe` in the command line (other OS version are available).
## Javascript
run `node ./AX25/send_kiss_frame.js orbitl-1 orbitl-2 "Orbital Space"` in the command line, make sure DireWolf is running.
### Packet to File
To save the packet to a file, close DireWolf and run `node .\receive_kiss_frame.js` instead, and repeat the command from just before, you'll see the file in the same directory.

## Python3
run `python ./AX25/send_kiss_frame.py orbitl-1 orbitl-2 "Orbital Space"` in the command line, make sure DireWolf is running.