#include "../include/kernel.h"
#include <string.h>

// Shell structures
static shell_t* current_shell = NULL;
static command_t* command_table[MAX_COMMANDS];
static uint32_t next_command_id = 1;

// Initialize shell system
void shell_init(void) {
    memset(command_table, 0, sizeof(command_table));
    current_shell = NULL;
}

// Create a new shell
shell_t* shell_create(const char* name) {
    shell_t* shell = (shell_t*)memory_alloc(sizeof(shell_t));
    if (shell == NULL) return NULL;

    strncpy(shell->name, name, MAX_NAME_LENGTH - 1);
    shell->name[MAX_NAME_LENGTH - 1] = '\0';
    shell->prompt = "SimpleOS> ";
    shell->history_size = 0;
    shell->history_position = 0;
    shell->current_directory[0] = '/';
    shell->current_directory[1] = '\0';
    shell->environment = NULL;
    shell->user = NULL;

    return shell;
}

// Destroy a shell
void shell_destroy(shell_t* shell) {
    if (shell == NULL) return;

    // Free history
    for (int i = 0; i < shell->history_size; i++) {
        memory_free(shell->history[i]);
    }

    // Free environment variables
    if (shell->environment != NULL) {
        memory_free(shell->environment);
    }

    memory_free(shell);
}

// Set current shell
void shell_set_current(shell_t* shell) {
    current_shell = shell;
}

// Get current shell
shell_t* shell_get_current(void) {
    return current_shell;
}

// Register a command
bool shell_register_command(const char* name, command_handler_t handler, const char* description) {
    // Find free command slot
    int slot = -1;
    for (int i = 0; i < MAX_COMMANDS; i++) {
        if (command_table[i] == NULL) {
            slot = i;
            break;
        }
    }

    if (slot == -1) return false; // No free slots

    // Allocate command structure
    command_t* command = (command_t*)memory_alloc(sizeof(command_t));
    if (command == NULL) return false;

    // Initialize command
    command->id = next_command_id++;
    strncpy(command->name, name, MAX_NAME_LENGTH - 1);
    command->name[MAX_NAME_LENGTH - 1] = '\0';
    command->handler = handler;
    strncpy(command->description, description, MAX_DESCRIPTION_LENGTH - 1);
    command->description[MAX_DESCRIPTION_LENGTH - 1] = '\0';

    // Add to command table
    command_table[slot] = command;

    return true;
}

// Unregister a command
void shell_unregister_command(const char* name) {
    for (int i = 0; i < MAX_COMMANDS; i++) {
        if (command_table[i] != NULL && strcmp(command_table[i]->name, name) == 0) {
            memory_free(command_table[i]);
            command_table[i] = NULL;
            break;
        }
    }
}

// Execute a command
bool shell_execute_command(shell_t* shell, const char* command_line) {
    if (shell == NULL || command_line == NULL) return false;

    // Add to history
    if (shell->history_size < MAX_HISTORY) {
        shell->history[shell->history_size] = (char*)memory_alloc(strlen(command_line) + 1);
        if (shell->history[shell->history_size] != NULL) {
            strcpy(shell->history[shell->history_size], command_line);
            shell->history_size++;
        }
    }

    // Parse command
    char command_name[MAX_NAME_LENGTH];
    char* args[MAX_ARGS];
    int arg_count = 0;

    // TODO: Implement command parsing

    // Find and execute command
    for (int i = 0; i < MAX_COMMANDS; i++) {
        if (command_table[i] != NULL && strcmp(command_table[i]->name, command_name) == 0) {
            return command_table[i]->handler(shell, arg_count, args);
        }
    }

    return false;
}

// Set shell prompt
void shell_set_prompt(shell_t* shell, const char* prompt) {
    if (shell != NULL && prompt != NULL) {
        shell->prompt = prompt;
    }
}

// Get shell prompt
const char* shell_get_prompt(shell_t* shell) {
    return shell != NULL ? shell->prompt : NULL;
}

// Set current directory
bool shell_set_current_directory(shell_t* shell, const char* directory) {
    if (shell == NULL || directory == NULL) return false;

    strncpy(shell->current_directory, directory, MAX_PATH_LENGTH - 1);
    shell->current_directory[MAX_PATH_LENGTH - 1] = '\0';
    return true;
}

// Get current directory
const char* shell_get_current_directory(shell_t* shell) {
    return shell != NULL ? shell->current_directory : NULL;
}

// Set environment variable
bool shell_set_environment_variable(shell_t* shell, const char* name, const char* value) {
    if (shell == NULL || name == NULL) return false;

    // TODO: Implement environment variable setting
    return true;
}

// Get environment variable
const char* shell_get_environment_variable(shell_t* shell, const char* name) {
    if (shell == NULL || name == NULL) return NULL;

    // TODO: Implement environment variable getting
    return NULL;
}

// List commands
void shell_list_commands(command_t** list, int* count) {
    if (list == NULL || count == NULL) return;

    *count = 0;
    for (int i = 0; i < MAX_COMMANDS; i++) {
        if (command_table[i] != NULL) {
            list[(*count)++] = command_table[i];
        }
    }
}

// Get command by name
command_t* shell_get_command_by_name(const char* name) {
    for (int i = 0; i < MAX_COMMANDS; i++) {
        if (command_table[i] != NULL && strcmp(command_table[i]->name, name) == 0) {
            return command_table[i];
        }
    }
    return NULL;
}

// Get command by ID
command_t* shell_get_command_by_id(uint32_t id) {
    for (int i = 0; i < MAX_COMMANDS; i++) {
        if (command_table[i] != NULL && command_table[i]->id == id) {
            return command_table[i];
        }
    }
    return NULL;
}

// Get command history
void shell_get_history(shell_t* shell, char** history, int* count) {
    if (shell == NULL || history == NULL || count == NULL) return;

    *count = shell->history_size;
    for (int i = 0; i < shell->history_size; i++) {
        history[i] = shell->history[i];
    }
}

// Clear command history
void shell_clear_history(shell_t* shell) {
    if (shell == NULL) return;

    for (int i = 0; i < shell->history_size; i++) {
        memory_free(shell->history[i]);
    }
    shell->history_size = 0;
    shell->history_position = 0;
}

// Set user
void shell_set_user(shell_t* shell, user_t* user) {
    if (shell != NULL) {
        shell->user = user;
    }
}

// Get user
user_t* shell_get_user(shell_t* shell) {
    return shell != NULL ? shell->user : NULL;
}

// Built-in commands
bool shell_command_help(shell_t* shell, int argc, char** argv) {
    // TODO: Implement help command
    return true;
}

bool shell_command_cd(shell_t* shell, int argc, char** argv) {
    // TODO: Implement cd command
    return true;
}

bool shell_command_ls(shell_t* shell, int argc, char** argv) {
    // TODO: Implement ls command
    return true;
}

bool shell_command_pwd(shell_t* shell, int argc, char** argv) {
    // TODO: Implement pwd command
    return true;
}

bool shell_command_echo(shell_t* shell, int argc, char** argv) {
    // TODO: Implement echo command
    return true;
}

bool shell_command_clear(shell_t* shell, int argc, char** argv) {
    // TODO: Implement clear command
    return true;
}

bool shell_command_exit(shell_t* shell, int argc, char** argv) {
    // TODO: Implement exit command
    return true;
} 