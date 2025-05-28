# Compiler and flags
CC = gcc
AS = nasm
CFLAGS = -m32 -nostdlib -nostdinc -fno-builtin -fno-stack-protector -nostartfiles -nodefaultlibs -Wall -Wextra -c -I./include
ASFLAGS = -f elf32
LDFLAGS = -T src/kernel/linker.ld -melf_i386

# Source files
SRC_DIR = src
KERNEL_SRC = $(SRC_DIR)/kernel/kernel.c
MM_SRC = $(SRC_DIR)/mm/memory.c
PROCESS_SRC = $(SRC_DIR)/process/process.c
FS_SRC = $(SRC_DIR)/fs/filesystem.c
DRIVER_SRC = $(SRC_DIR)/drivers/device.c
INTERRUPT_SRC = $(SRC_DIR)/interrupts/interrupt.c
NETWORK_SRC = $(SRC_DIR)/net/network.c
SHELL_SRC = $(SRC_DIR)/shell/shell.c
UTILS_SRC = $(SRC_DIR)/utils/utils.c
BOOT_SRC = $(SRC_DIR)/boot/boot.asm

# Object files
KERNEL_OBJ = $(KERNEL_SRC:.c=.o)
MM_OBJ = $(MM_SRC:.c=.o)
PROCESS_OBJ = $(PROCESS_SRC:.c=.o)
FS_OBJ = $(FS_SRC:.c=.o)
DRIVER_OBJ = $(DRIVER_SRC:.c=.o)
INTERRUPT_OBJ = $(INTERRUPT_SRC:.c=.o)
NETWORK_OBJ = $(NETWORK_SRC:.c=.o)
SHELL_OBJ = $(SHELL_SRC:.c=.o)
UTILS_OBJ = $(UTILS_SRC:.c=.o)
BOOT_OBJ = $(BOOT_SRC:.asm=.o)

# Output files
KERNEL_BIN = kernel.bin
ISO = SimpleOS.iso

# Build targets
all: $(ISO)

$(ISO): $(KERNEL_BIN)
	mkdir -p iso/boot/grub
	cp $(KERNEL_BIN) iso/boot/
	echo 'set timeout=0' > iso/boot/grub/grub.cfg
	echo 'set default=0' >> iso/boot/grub/grub.cfg
	echo 'menuentry "SimpleOS" {' >> iso/boot/grub/grub.cfg
	echo '  multiboot /boot/kernel.bin' >> iso/boot/grub/grub.cfg
	echo '  boot' >> iso/boot/grub/grub.cfg
	echo '}' >> iso/boot/grub/grub.cfg
	grub-mkrescue -o $(ISO) iso

$(KERNEL_BIN): $(KERNEL_OBJ) $(MM_OBJ) $(PROCESS_OBJ) $(FS_OBJ) $(DRIVER_OBJ) $(INTERRUPT_OBJ) $(NETWORK_OBJ) $(SHELL_OBJ) $(UTILS_OBJ) $(BOOT_OBJ)
	$(CC) $(LDFLAGS) -o $@ $^

%.o: %.c
	$(CC) $(CFLAGS) -o $@ $<

%.o: %.asm
	$(AS) $(ASFLAGS) -o $@ $<

# Clean target
clean:
	rm -f $(KERNEL_BIN) $(ISO) $(KERNEL_OBJ) $(MM_OBJ) $(PROCESS_OBJ) $(FS_OBJ) $(DRIVER_OBJ) $(INTERRUPT_OBJ) $(NETWORK_OBJ) $(SHELL_OBJ) $(UTILS_OBJ) $(BOOT_OBJ)
	rm -rf iso

# Run target
run: $(ISO)
	qemu-system-i386 -cdrom $(ISO)

.PHONY: all clean run 