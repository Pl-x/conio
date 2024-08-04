import subprocess

def run_command(command):
    try:
        print(f"Running command: {command}")
        subprocess.run(command, shell=True, check=True)
        print(f"Command succeeded: {command}")
    except subprocess.CalledProcessError as e:
        print(f"Command failed: {command}\nError: {e}")

def reinstall_grub(root_partition, efi_partition, drive):
    commands = [
        f"mount {root_partition} /mnt",
        "mount --bind /dev /mnt/dev",
        "mount --bind /proc /mnt/proc",
        "mount --bind /sys /mnt/sys",
        f"mount {efi_partition} /mnt/boot",
        "chroot /mnt",
        "apt update && apt upgrade -y",
        f"grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=grub --recheck {drive}",
        "update-grub",
        "exit",
        "umount /mnt/dev && umount /mnt/proc && umount /mnt/sys && umount /mnt",
        "reboot"
    ]

    for command in commands:
        run_command(command)

if __name__ == "__main__":
    root_partition = input("Enter the root partition (e.g., /dev/sdX#): ")
    efi_partition = input("Enter the EFI partition (e.g., /dev/sdX1): ")
    drive = input("Enter the drive (e.g., /dev/sdX): ")

    reinstall_grub(root_partition, efi_partition, drive)
