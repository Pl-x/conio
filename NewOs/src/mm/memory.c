#include "../include/kernel.h"
#include <string.h>

// Memory management structures
static memory_block_t* kernel_heap_start = (memory_block_t*)KERNEL_HEAP_START;
static memory_block_t* kernel_heap_end = (memory_block_t*)KERNEL_HEAP_END;
static memory_block_t* user_heap_start = (memory_block_t*)USER_HEAP_START;
static memory_block_t* user_heap_end = (memory_block_t*)USER_HEAP_END;

// Initialize memory management
void memory_init(void) {
    // Initialize kernel heap
    kernel_heap_start->start = (uint32_t)kernel_heap_start + sizeof(memory_block_t);
    kernel_heap_start->size = KERNEL_HEAP_END - kernel_heap_start->start;
    kernel_heap_start->is_free = true;
    kernel_heap_start->next = NULL;

    // Initialize user heap
    user_heap_start->start = (uint32_t)user_heap_start + sizeof(memory_block_t);
    user_heap_start->size = USER_HEAP_END - user_heap_start->start;
    user_heap_start->is_free = true;
    user_heap_start->next = NULL;
}

// Allocate memory from heap
void* memory_alloc(size_t size) {
    // Align size to page boundary
    size = (size + PAGE_SIZE - 1) & ~(PAGE_SIZE - 1);

    // Find free block
    memory_block_t* current = kernel_heap_start;
    while (current != NULL) {
        if (current->is_free && current->size >= size) {
            // Split block if it's too large
            if (current->size > size + sizeof(memory_block_t) + PAGE_SIZE) {
                memory_block_t* new_block = (memory_block_t*)(current->start + size);
                new_block->start = (uint32_t)new_block + sizeof(memory_block_t);
                new_block->size = current->size - size - sizeof(memory_block_t);
                new_block->is_free = true;
                new_block->next = current->next;
                current->next = new_block;
                current->size = size;
            }

            current->is_free = false;
            return (void*)current->start;
        }
        current = current->next;
    }

    return NULL; // Out of memory
}

// Free allocated memory
void memory_free(void* ptr) {
    if (ptr == NULL) return;

    // Find the block
    memory_block_t* current = kernel_heap_start;
    while (current != NULL) {
        if (current->start == (uint32_t)ptr) {
            current->is_free = true;

            // Merge with adjacent free blocks
            memory_block_t* prev = NULL;
            memory_block_t* next = current->next;
            
            if (prev != NULL && prev->is_free) {
                prev->size += current->size + sizeof(memory_block_t);
                prev->next = next;
                current = prev;
            }
            
            if (next != NULL && next->is_free) {
                current->size += next->size + sizeof(memory_block_t);
                current->next = next->next;
            }
            
            return;
        }
        current = current->next;
    }
}

// Memory copy function
void* memory_copy(void* dest, const void* src, size_t n) {
    return memcpy(dest, src, n);
}

// Memory set function
void* memory_set(void* dest, int val, size_t n) {
    return memset(dest, val, n);
}

// Memory compare function
int memory_compare(const void* ptr1, const void* ptr2, size_t n) {
    return memcmp(ptr1, ptr2, n);
}

// Get memory statistics
void memory_stats(size_t* total, size_t* used, size_t* free) {
    *total = 0;
    *used = 0;
    *free = 0;

    memory_block_t* current = kernel_heap_start;
    while (current != NULL) {
        *total += current->size;
        if (current->is_free) {
            *free += current->size;
        } else {
            *used += current->size;
        }
        current = current->next;
    }
}

// Memory protection functions
bool memory_protect(void* addr, size_t size, uint32_t flags) {
    // TODO: Implement memory protection
    return true;
}

bool memory_unprotect(void* addr, size_t size) {
    // TODO: Implement memory unprotection
    return true;
}

// Memory mapping functions
void* memory_map(void* addr, size_t size, uint32_t flags) {
    // TODO: Implement memory mapping
    return NULL;
}

bool memory_unmap(void* addr, size_t size) {
    // TODO: Implement memory unmapping
    return true;
}

// Memory locking functions
bool memory_lock(void* addr, size_t size) {
    // TODO: Implement memory locking
    return true;
}

bool memory_unlock(void* addr, size_t size) {
    // TODO: Implement memory unlocking
    return true;
} 