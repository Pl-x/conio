#include <stdint.h>
#include <stddef.h>
#include "../include/kernel.h"
#include <stdbool.h>
#include <string.h>
#include <memory.h>
#include <process.h>
#include <fs.h>
#include <device.h>
#include <interrupt.h>
#include <net.h>
#include <shell.h>
#include <utils.h>

// VGA text mode colors
enum vga_color {
    VGA_COLOR_BLACK = 0,
    VGA_COLOR_BLUE = 1,
    VGA_COLOR_GREEN = 2,
    VGA_COLOR_CYAN = 3,
    VGA_COLOR_RED = 4,
    VGA_COLOR_MAGENTA = 5,
    VGA_COLOR_BROWN = 6,
    VGA_COLOR_LIGHT_GREY = 7,
    VGA_COLOR_DARK_GREY = 8,
    VGA_COLOR_LIGHT_BLUE = 9,
    VGA_COLOR_LIGHT_GREEN = 10,
    VGA_COLOR_LIGHT_CYAN = 11,
    VGA_COLOR_LIGHT_RED = 12,
    VGA_COLOR_LIGHT_MAGENTA = 13,
    VGA_COLOR_LIGHT_BROWN = 14,
    VGA_COLOR_WHITE = 15,
};

// VGA text mode buffer
static const size_t VGA_WIDTH = 80;
static const size_t VGA_HEIGHT = 25;
static uint16_t* const VGA_MEMORY = (uint16_t*)0xB8000;

// Terminal state
static size_t terminal_row;
static size_t terminal_column;
static uint8_t terminal_color;
static uint16_t* terminal_buffer;

// Forward declarations
static inline uint8_t vga_entry_color(enum vga_color fg, enum vga_color bg);
static inline uint16_t vga_entry(unsigned char uc, uint8_t color);
void terminal_putentryat(char c, uint8_t color, size_t x, size_t y);
void terminal_putchar(char c);
void terminal_writestring(const char* data);

// Set terminal color
static inline uint8_t vga_entry_color(enum vga_color fg, enum vga_color bg) {
    return fg | bg << 4;
}

// Create VGA entry
static inline uint16_t vga_entry(unsigned char uc, uint8_t color) {
    return (uint16_t) uc | (uint16_t) color << 8;
}

// Initialize terminal
void terminal_initialize(void) {
    terminal_row = 0;
    terminal_column = 0;
    terminal_color = vga_entry_color(VGA_COLOR_LIGHT_GREY, VGA_COLOR_BLACK);
    terminal_buffer = VGA_MEMORY;
    for (size_t y = 0; y < VGA_HEIGHT; y++) {
        for (size_t x = 0; x < VGA_WIDTH; x++) {
            const size_t index = y * VGA_WIDTH + x;
            terminal_buffer[index] = vga_entry(' ', terminal_color);
        }
    }
}

// Put character at position
void terminal_putentryat(char c, uint8_t color, size_t x, size_t y) {
    const size_t index = y * VGA_WIDTH + x;
    terminal_buffer[index] = vga_entry(c, color);
}

// Put character
void terminal_putchar(char c) {
    if (c == '\n') {
        terminal_column = 0;
        if (++terminal_row == VGA_HEIGHT)
            terminal_row = 0;
        return;
    }
    terminal_putentryat(c, terminal_color, terminal_column, terminal_row);
    if (++terminal_column == VGA_WIDTH) {
        terminal_column = 0;
        if (++terminal_row == VGA_HEIGHT)
            terminal_row = 0;
    }
}

// Write string
void terminal_writestring(const char* data) {
    for (size_t i = 0; data[i] != '\0'; i++)
        terminal_putchar(data[i]);
}

// Kernel main function
void kernel_main(void) {
    // Initialize memory management
    memory_init();

    // Initialize process management
    process_init();

    // Initialize file system
    fs_init();

    // Initialize device system
    device_init();

    // Initialize interrupt system
    interrupt_init();

    // Initialize network system
    network_init();

    // Initialize shell system
    shell_init();

    // Initialize utility functions
    log_init();
    random_init(time_get_current());

    // Create root shell
    shell_t* root_shell = shell_create("root");
    if (root_shell != NULL) {
        shell_set_current(root_shell);
    }

    // Register built-in commands
    shell_register_command("help", shell_command_help, "Display help information");
    shell_register_command("cd", shell_command_cd, "Change current directory");
    shell_register_command("ls", shell_command_ls, "List directory contents");
    shell_register_command("pwd", shell_command_pwd, "Print working directory");
    shell_register_command("echo", shell_command_echo, "Display a line of text");
    shell_register_command("clear", shell_command_clear, "Clear the screen");
    shell_register_command("exit", shell_command_exit, "Exit the shell");

    // Main kernel loop
    while (1) {
        // Process scheduling
        process_schedule();

        // Handle interrupts
        if (interrupt_is_enabled()) {
            // TODO: Handle pending interrupts
        }

        // Shell input/output
        if (current_shell != NULL) {
            // TODO: Handle shell input/output
        }
    }
} 