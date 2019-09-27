# Running QEMU with Raspbian
## Getting Started
1. Make sure you have the latest QEMU installed https://www.qemu.org/download/.
2. Download the raspberry pi image (tested on "2018-08-03-Raspbian-SatNOGS-lite.img" from https://wiki.satnogs.org/Raspberry_Pi_3 see step 4 `file=...`).
3. Keep the necessary files that I've included in this folder (or download from https://github.com/dhruvvyas90/qemu-rpi-kernel).
4. Run `C:\"Program Files"\qemu\qemu-system-arm.exe -M versatilepb -cpu arm1176 -m 256 -drive file=.\2018-08-03-Raspbian-SatNOGS-lite.img,format=raw -net nic -net user,hostfwd=tcp::5022-:22 -dtb .\versatile-pb.dtb -kernel .\kernel-qemu-4.14.79-stretch -append 'root=/dev/sda2 panic=1' -no-reboot` should work on other OS with the same parameters.

## SSH into Raspberry Pi
If all goes well you should see the raspberry pi open in a new QEMU screen, the default username is `pi` and password `raspberry` you can also SSH into your raspberry pi with the following:
1. Host: 127.0.0.1
2. Port: 5022 (Or whatever you've defined in the parameters, see the `-net` parameter)