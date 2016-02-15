#!/bin/bash

echo 1 >> /proc/sys/net/ipv4/ip_forward 

Añadimos las reglas
# Always accept loopback traffic
iptables -A INPUT -i lo -j ACCEPT

# We allow traffic from the LAN side
iptables -A INPUT -i eth0 -j ACCEPT

######################################################################
#
#                         ROUTING
#
######################################################################

# eth0 is LAN card 1
# eth1 is LAN card 2

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
# Masquerade.
iptables -t nat -A POSTROUTING -o eth1 -j MASQUERADE
# fowarding
iptables -A FORWARD -i eth1 -o eth0 -m state //
                           --state RELATED,ESTABLISHED -j ACCEPT
# Allow outgoing connections from the LAN side.
iptables -A FORWARD -i eth0 -o eth1 -j ACCEPT

#Fuente : 
#http://serverfault.com/questions/453254/routing-between-two-networks-on-linux
