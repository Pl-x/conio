[BITS 16]           ; 16-bit Real Mode
[ORG 0x7C00]        ; BIOS loads bootloader at this address

; Initialize segments
cli                 ; Disable interrupts
mov ax, 0x0000      ; Set up segments
mov ds, ax
mov es, ax
mov ss, ax
mov sp, 0x7C00      ; Set up stack pointer
sti                 ; Enable interrupts

; Print welcome message
mov si, welcome_msg
call print_string

; Load kernel
mov ah, 0x02        ; BIOS read sector function
mov al, 1           ; Number of sectors to read
mov ch, 0           ; Cylinder number
mov cl, 2           ; Sector number (1 is bootloader)
mov dh, 0           ; Head number
mov dl, 0x80        ; Drive number (first hard disk)
mov bx, 0x1000      ; Load address
int 0x13            ; Call BIOS interrupt

; Jump to kernel
jmp 0x1000

; Function to print string
print_string:
    mov ah, 0x0E    ; BIOS teletype function
.loop:
    lodsb           ; Load byte from SI into AL
    test al, al     ; Check if end of string
    jz .done        ; If zero, we're done
    int 0x10        ; Print character
    jmp .loop       ; Repeat for next character
.done:
    ret

; Data
welcome_msg db 'Booting SimpleOS...', 0x0D, 0x0A, 0

; Boot signature
times 510-($-$$) db 0   ; Pad to 510 bytes
dw 0xAA55               ; Boot signature 