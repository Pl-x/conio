#include "../../include/device.h"
#include "../../include/kernel.h"
#include <string.h>

// Device driver structures
static device_t* device_table[MAX_DEVICES];
static uint32_t next_device_id = 1;

// Initialize device system
void device_init(void) {
    memset(device_table, 0, sizeof(device_table));
}

// Register a device
device_t* device_register(const char* name, device_type_t type, void* driver_data) {
    // Find free slot
    int slot = -1;
    for (int i = 0; i < MAX_DEVICES; i++) {
        if (device_table[i] == NULL) {
            slot = i;
            break;
        }
    }
    if (slot == -1) return NULL;

    // Allocate and initialize device
    device_t* device = (device_t*)memory_alloc(sizeof(device_t));
    if (!device) return NULL;

    strncpy(device->name, name, 31);
    device->name[31] = '\0';
    device->type = type;
    device->id = next_device_id++;
    device->state = DEVICE_STATE_OFF;
    device->open_count = 0;
    device->error_count = 0;
    device->last_error = ERR_NONE;
    device->is_initialized = false;
    device->driver_data = driver_data;

    device_table[slot] = device;
    return device;
}

// Unregister a device
error_t device_unregister(uint32_t device_id) {
    for (int i = 0; i < MAX_DEVICES; i++) {
        if (device_table[i] && device_table[i]->id == device_id) {
            if (device_table[i]->open_count > 0) {
                return ERR_DEVICE_BUSY;
            }
            memory_free(device_table[i]);
            device_table[i] = NULL;
            return ERR_NONE;
        }
    }
    return ERR_DEVICE_NOT_FOUND;
}

// Open a device
bool device_open(device_t* device) {
    if (!device || !device->is_initialized) return false;
    device->open_count++;
    device->state = DEVICE_STATE_OPEN;
    return true;
}

// Close a device
bool device_close(device_t* device) {
    if (!device) return false;
    if (device->open_count > 0) {
        device->open_count--;
        if (device->open_count == 0) {
            device->state = DEVICE_STATE_CLOSED;
        }
        return true;
    }
    return false;
}

// Read from device
bool device_read(device_t* device, void* buffer, size_t size) {
    if (!device || !buffer || !device->is_initialized) return false;
    // TODO: Implement actual device read
    return true;
}

// Write to device
bool device_write(device_t* device, const void* buffer, size_t size) {
    if (!device || !buffer || !device->is_initialized) return false;
    // TODO: Implement actual device write
    return true;
}

// Control device
bool device_ioctl(device_t* device, uint32_t request, void* arg) {
    if (!device || !device->is_initialized) return false;
    // TODO: Implement actual device ioctl
    return true;
}

// Get device information
void device_get_info(device_t* device, device_info_t* info) {
    if (!device || !info) return;
    strncpy(info->name, device->name, 31);
    info->name[31] = '\0';
    info->type = device->type;
    info->id = device->id;
    info->state = device->state;
    info->open_count = device->open_count;
    info->error_count = device->error_count;
    info->last_error = device->last_error;
    info->is_initialized = device->is_initialized;
}

// Set device state
void device_set_state(device_t* device, device_state_t state) {
    if (!device) return;
    device->state = state;
}

// Get device by ID
device_t* device_get_by_id(uint32_t id) {
    for (int i = 0; i < MAX_DEVICES; i++) {
        if (device_table[i] != NULL && device_table[i]->id == id) {
            return device_table[i];
        }
    }
    return NULL;
}

// Get device by name
device_t* device_get_by_name(const char* name) {
    for (int i = 0; i < MAX_DEVICES; i++) {
        if (device_table[i] != NULL && strcmp(device_table[i]->name, name) == 0) {
            return device_table[i];
        }
    }
    return NULL;
}

// List devices
void device_list(device_t** list, int* count) {
    if (list == NULL || count == NULL) return;

    *count = 0;
    for (int i = 0; i < MAX_DEVICES; i++) {
        if (device_table[i] != NULL) {
            list[(*count)++] = device_table[i];
        }
    }
}

// Device error handling
void device_set_error(device_t* device, error_t error) {
    if (!device) return;
    if (error != ERR_NONE) {
        device->error_count++;
        device->last_error = error;
        device->state = DEVICE_STATE_ERROR;
    }
}

// Device power management
bool device_power_on(device_t* device) {
    if (!device) return false;
    device->state = DEVICE_STATE_READY;
    device->is_initialized = true;
    return true;
}

bool device_power_off(device_t* device) {
    if (!device) return false;
    device->state = DEVICE_STATE_OFF;
    device->is_initialized = false;
    return true;
}

// Device reset
bool device_reset(device_t* device) {
    if (!device) return false;
    device->state = DEVICE_STATE_READY;
    device->error_count = 0;
    device->last_error = ERR_NONE;
    return true;
} 