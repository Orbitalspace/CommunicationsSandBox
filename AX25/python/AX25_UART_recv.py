 #!/usr/bin/env python  
from ax25_decoder import ax25decode
import time
import serial
        
ser = serial.Serial(       
 port='/dev/tty.usbserial-AL0157YE',
 baudrate = 115200,
 parity=serial.PARITY_NONE,
 stopbits=serial.STOPBITS_ONE,
 bytesize=serial.EIGHTBITS,
 timeout=1
)
   
while 1:
    ax25decode(ser.readline())
