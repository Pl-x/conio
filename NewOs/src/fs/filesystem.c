#include "../include/kernel.h"
#include <string.h>

// File system structures
static file_t* file_table[MAX_OPEN_FILES];
static directory_t* root_directory = NULL;
static uint32_t next_fd = 1;

// Helper to get file_t* from fd
static file_t* get_file_by_fd(uint32_t fd) {
    for (int i = 0; i < MAX_OPEN_FILES; i++) {
        if (file_table[i] && file_table[i]->fd == (int)fd) {
            return file_table[i];
        }
    }
    return NULL;
}

// Initialize file system
void fs_init(void) {
    memset(file_table, 0, sizeof(file_table));

    // Create root directory
    root_directory = (directory_t*)memory_alloc(sizeof(directory_t));
    if (root_directory == NULL) return;

    root_directory->name[0] = '/';
    root_directory->name[1] = '\0';
    root_directory->parent = NULL;
    root_directory->first_child = NULL;
    root_directory->next = NULL;
}

// Create a new file
file_t* file_create(const char* name, file_type_t type) {
    // Find free file slot
    int slot = -1;
    for (int i = 0; i < MAX_OPEN_FILES; i++) {
        if (file_table[i] == NULL) {
            slot = i;
            break;
        }
    }

    if (slot == -1) return NULL; // No free slots

    // Allocate file structure
    file_t* file = (file_t*)memory_alloc(sizeof(file_t));
    if (file == NULL) return NULL;

    // Initialize file
    file->fd = next_fd++;
    strncpy(file->name, name, MAX_NAME_LENGTH - 1);
    file->name[MAX_NAME_LENGTH - 1] = '\0';
    file->type = type;
    file->size = 0;
    file->position = 0;
    file->permissions = 0644; // rw-r--r--
    file->owner = 0; // root
    file->group = 0; // root
    file->creation_time = 0; // TODO: Implement system time
    file->modification_time = 0;
    file->access_time = 0;
    file->data = NULL;

    // Add to file table
    file_table[slot] = file;

    return file;
}

// Open a file (returns fd via out param, returns error_t)
error_t file_open(const char* path, uint32_t flags) {
    // Find free file slot
    int slot = -1;
    for (int i = 0; i < MAX_OPEN_FILES; i++) {
        if (file_table[i] == NULL) {
            slot = i;
            break;
        }
    }
    if (slot == -1) return ERR_OUT_OF_MEMORY;

    // Allocate and initialize file_t
    file_t* file = (file_t*)memory_alloc(sizeof(file_t));
    if (!file) return ERR_OUT_OF_MEMORY;
    file->fd = next_fd++;
    strncpy(file->name, path, MAX_FILENAME_LENGTH-1);
    file->name[MAX_FILENAME_LENGTH-1] = '\0';
    file->size = 0;
    file->type = FILE_TYPE_REGULAR;
    file->permissions = flags; // Use flags to set permissions
    file->owner = 0;
    file->group = 0;
    file->created = 0;
    file->modified = 0;
    file->accessed = 0;
    file->position = 0;
    file->data = NULL;
    file->access_time = 0;
    file->modification_time = 0;
    file->creation_time = 0;
    file_table[slot] = file;
    return file->fd;
}

// Close a file by fd
error_t file_close(uint32_t fd) {
    for (int i = 0; i < MAX_OPEN_FILES; i++) {
        if (file_table[i] && file_table[i]->fd == (int)fd) {
            memory_free(file_table[i]);
            file_table[i] = NULL;
            return ERR_NONE;
        }
    }
    return ERR_INVALID_ARGUMENT;
}

// Read from a file by fd
error_t file_read(uint32_t fd, void* buffer, size_t size) {
    file_t* file = get_file_by_fd(fd);
    if (!file || !buffer) return ERR_INVALID_ARGUMENT;
    if (file->position >= file->size) return 0;
    size_t to_read = size;
    if (file->position + to_read > file->size) {
        to_read = file->size - file->position;
    }
    if (file->data) {
        memcpy(buffer, (char*)file->data + file->position, to_read);
    }
    file->position += to_read;
    file->access_time = 0; // TODO: Update access time
    return to_read;
}

// Write to a file by fd
error_t file_write(uint32_t fd, const void* buffer, size_t size) {
    file_t* file = get_file_by_fd(fd);
    if (!file || !buffer) return ERR_INVALID_ARGUMENT;
    if (!file->data || file->position + size > file->size) {
        void* new_data = memory_alloc(file->position + size);
        if (file->data) {
            memcpy(new_data, file->data, file->size);
            memory_free(file->data);
        }
        file->data = new_data;
        file->size = file->position + size;
    }
    memcpy((char*)file->data + file->position, buffer, size);
    file->position += size;
    file->modification_time = 0; // TODO: Update modification time
    file->access_time = 0; // TODO: Update access time
    return size;
}

// Seek in file
bool file_seek(file_t* file, int64_t offset, file_seek_t whence) {
    if (file == NULL) return false;

    int64_t new_position;
    switch (whence) {
        case FILE_SEEK_SET:
            new_position = offset;
            break;
        case FILE_SEEK_CUR:
            new_position = file->position + offset;
            break;
        case FILE_SEEK_END:
            new_position = file->size + offset;
            break;
        default:
            return false;
    }

    if (new_position < 0 || new_position > file->size) {
        return false;
    }

    file->position = new_position;
    return true;
}

// Get file information
void file_get_info(file_t* file, file_info_t* info) {
    if (file != NULL && info != NULL) {
        strncpy(info->name, file->name, MAX_NAME_LENGTH - 1);
        info->name[MAX_NAME_LENGTH - 1] = '\0';
        info->type = file->type;
        info->size = file->size;
        info->permissions = file->permissions;
        info->owner = file->owner;
        info->group = file->group;
        info->creation_time = file->creation_time;
        info->modification_time = file->modification_time;
        info->access_time = file->access_time;
    }
}

// Set file permissions
bool file_set_permissions(file_t* file, uint32_t permissions) {
    if (file == NULL) return false;
    file->permissions = permissions;
    return true;
}

// Delete a file
bool file_delete(const char* path) {
    // TODO: Implement path resolution
    // For now, just search by name
    for (int i = 0; i < MAX_OPEN_FILES; i++) {
        if (file_table[i] != NULL && strcmp(file_table[i]->name, path) == 0) {
            if (file_table[i]->data != NULL) {
                memory_free(file_table[i]->data);
            }
            memory_free(file_table[i]);
            file_table[i] = NULL;
            return true;
        }
    }
    return false;
}

// Directory operations
directory_t* directory_create(const char* name, directory_t* parent) {
    directory_t* dir = (directory_t*)memory_alloc(sizeof(directory_t));
    if (dir == NULL) return NULL;

    strncpy(dir->name, name, MAX_NAME_LENGTH - 1);
    dir->name[MAX_NAME_LENGTH - 1] = '\0';
    dir->parent = parent;
    dir->first_child = NULL;
    dir->next = NULL;

    if (parent != NULL) {
        dir->next = parent->first_child;
        parent->first_child = dir;
    }

    return dir;
}

// List directory contents
void directory_list(directory_t* dir, directory_entry_t* entries, int* count) {
    if (dir == NULL || entries == NULL || count == NULL) return;

    *count = 0;
    directory_t* child = dir->first_child;
    while (child != NULL && *count < MAX_DIRECTORY_ENTRIES) {
        strncpy(entries[*count].name, child->name, MAX_NAME_LENGTH - 1);
        entries[*count].name[MAX_NAME_LENGTH - 1] = '\0';
        entries[*count].type = FILE_TYPE_DIRECTORY;
        (*count)++;
        child = child->next;
    }

    // TODO: Add files to the list
} 