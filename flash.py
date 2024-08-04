import os
import subprocess
import numpy as np

def ground():
    # Request user input for the flash drive path
    drive_path = input("Enter the path of the flash drive (e.g., /dev/sdX1): ")

    # Check for bad blocks
    check_badblocks_cmd = f"sudo badblocks -v {drive_path}"
    try:
        badblocks_output = subprocess.check_output(check_badblocks_cmd, shell=True, stderr=subprocess.STDOUT).decode()
        has_bad_blocks = bool(badblocks_output.strip())
    except subprocess.CalledProcessError as e:
        badblocks_output = e.output.decode()
        has_bad_blocks = bool(badblocks_output.strip())
    
    if has_bad_blocks:
        # Fix bad blocks (requires fsck or a similar tool, depending on the filesystem)
        print("Bad blocks found. Attempting to fix...")
        fix_cmd = f"sudo fsck -vcck {drive_path}"
        subprocess.run(fix_cmd, shell=True)
        
        # Format to exFAT
        format_cmd = f"sudo mkfs.exfat -n flashed {drive_path}"
        subprocess.run(format_cmd, shell=True)
        print(f"{drive_path} formatted to exFAT and labeled as 'flashed'.")
    else:
        # If no bad blocks, skip formatting but label it as 'pass'
        print("No bad blocks found. Labeling drive as 'pass'.")
        mount_point = "/mnt/temp_flash"
        os.makedirs(mount_point, exist_ok=True)
        
        mount_cmd = f"sudo mount {drive_path} {mount_point}"
        subprocess.run(mount_cmd, shell=True)
        
        label_cmd = f"sudo exfatlabel {drive_path} pass"
        subprocess.run(label_cmd, shell=True)
        
        unmount_cmd = f"sudo umount {drive_path}"
        subprocess.run(unmount_cmd, shell=True)
        
        os.rmdir(mount_point)
        print(f"{drive_path} labeled as 'pass'.")

# Call the function
ground()
