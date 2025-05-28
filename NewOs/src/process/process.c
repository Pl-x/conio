#include "../include/kernel.h"
#include <string.h>

// Process table
static process_t* process_table[MAX_PROCESSES];
static uint32_t next_pid = 1;
static process_t* current_process = NULL;

// Initialize process management
void process_init(void) {
    memset(process_table, 0, sizeof(process_table));
}

// Create a new process
error_t process_create(const char* name, void* entry_point, uint32_t priority) {
    // Find free slot in process table
    int slot = -1;
    for (int i = 0; i < MAX_PROCESSES; i++) {
        if (process_table[i] == NULL) {
            slot = i;
            break;
        }
    }

    if (slot == -1) {
        return ERR_OUT_OF_MEMORY;
    }

    // Allocate process structure
    process_t* process = (process_t*)memory_alloc(sizeof(process_t));
    if (process == NULL) {
        return ERR_OUT_OF_MEMORY;
    }

    // Initialize process
    process->pid = next_pid++;
    strncpy(process->name, name, MAX_NAME_LENGTH - 1);
    process->name[MAX_NAME_LENGTH - 1] = '\0';
    process->state = PROC_READY;
    process->priority = priority;
    process->entry_point = entry_point;
    process->stack_ptr = 0;
    process->stack_size = DEFAULT_STACK_SIZE;
    process->heap_ptr = 0;
    process->heap_size = 0;
    process->parent_pid = 0;
    process->exit_code = 0;
    process->cpu_time = 0;
    process->memory_usage = 0;
    process->creation_time = 0; // TODO: Implement system time

    // Create main thread
    process->thread = (thread_t*)memory_alloc(sizeof(thread_t));
    if (process->thread == NULL) {
        memory_free(process);
        return ERR_OUT_OF_MEMORY;
    }

    // Initialize thread
    process->thread->tid = 1;
    process->thread->pid = process->pid;
    process->thread->stack_ptr = 0;
    process->thread->stack_size = DEFAULT_STACK_SIZE;
    process->thread->priority = priority;
    process->thread->is_main = true;

    // Add to process table
    process_table[slot] = process;

    return ERR_NONE;
}

// Terminate a process
error_t process_terminate(uint32_t pid) {
    // Find process
    process_t* process = NULL;
    int slot = -1;
    for (int i = 0; i < MAX_PROCESSES; i++) {
        if (process_table[i] != NULL && process_table[i]->pid == pid) {
            process = process_table[i];
            slot = i;
            break;
        }
    }

    if (process == NULL) {
        return ERR_INVALID_ARGUMENT;
    }

    // Update process state
    process->state = PROC_TERMINATED;

    // Free thread
    if (process->thread != NULL) {
        memory_free(process->thread);
    }

    // Free process
    memory_free(process);
    process_table[slot] = NULL;

    return ERR_NONE;
}

// Get process by PID
process_t* process_get_by_pid(uint32_t pid) {
    for (int i = 0; i < MAX_PROCESSES; i++) {
        if (process_table[i] != NULL && process_table[i]->pid == pid) {
            return process_table[i];
        }
    }
    return NULL;
}

// Get current process
process_t* process_get_current(void) {
    return current_process;
}

// Set current process
void process_set_current(process_t* process) {
    current_process = process;
}

// Schedule processes
void process_schedule(void) {
    // Find highest priority ready process
    process_t* highest_priority = NULL;
    int highest_priority_value = -1;

    for (int i = 0; i < MAX_PROCESSES; i++) {
        if (process_table[i] != NULL && 
            process_table[i]->state == PROC_READY) {
            if (process_table[i]->priority > highest_priority_value) {
                highest_priority = process_table[i];
                highest_priority_value = process_table[i]->priority;
            }
        }
    }

    // Switch to highest priority process
    if (highest_priority != NULL) {
        // TODO: Implement context switch
        highest_priority->state = PROC_RUNNING;
    }
}

// Process state management
void process_set_state(process_t* process, process_state_t state) {
    if (process != NULL) {
        process->state = state;
    }
}

// Set process priority
void process_set_priority(process_t* process, uint32_t priority) {
    if (process != NULL) {
        process->priority = priority;
        if (process->thread != NULL) {
            process->thread->priority = priority;
        }
    }
}

// Get process statistics
void process_get_stats(process_t* process, process_stats_t* stats) {
    if (process == NULL || stats == NULL) {
        return;
    }

    stats->total_processes = 0;
    stats->running_processes = 0;
    stats->blocked_processes = 0;
    stats->sleeping_processes = 0;
    stats->total_threads = 0;
    stats->running_threads = 0;
    stats->total_cpu_time = 0;
    stats->total_memory_usage = 0;

    for (int i = 0; i < MAX_PROCESSES; i++) {
        if (process_table[i] != NULL) {
            stats->total_processes++;
            stats->total_cpu_time += process_table[i]->cpu_time;
            stats->total_memory_usage += process_table[i]->memory_usage;

            switch (process_table[i]->state) {
                case PROC_RUNNING:
                    stats->running_processes++;
                    break;
                case PROC_BLOCKED:
                    stats->blocked_processes++;
                    break;
                case PROC_SLEEPING:
                    stats->sleeping_processes++;
                    break;
                default:
                    break;
            }

            if (process_table[i]->thread != NULL) {
                stats->total_threads++;
                // TODO: Add thread state tracking
            }
        }
    }
}

// Process list
void process_list(process_t** list, int* count) {
    if (list == NULL || count == NULL) return;

    *count = 0;
    for (int i = 0; i < MAX_PROCESSES; i++) {
        if (process_table[i] != NULL) {
            list[(*count)++] = process_table[i];
        }
    }
} 