#ifndef DEVICE_H
#define DEVICE_H

#include "kernel.h"

// Device types
typedef enum {
    DEVICE_TYPE_CHAR,
    DEVICE_TYPE_BLOCK,
    DEVICE_TYPE_NETWORK,
    DEVICE_TYPE_DISPLAY,
    DEVICE_TYPE_INPUT,
    DEVICE_TYPE_SERIAL,
    DEVICE_TYPE_UNKNOWN
} device_type_t;

// Device states
typedef enum {
    DEVICE_STATE_OFF,
    DEVICE_STATE_READY,
    DEVICE_STATE_OPEN,
    DEVICE_STATE_CLOSED,
    DEVICE_STATE_ERROR
} device_state_t;

// Device info structure
typedef struct {
    char name[32];
    device_type_t type;
    uint32_t id;
    device_state_t state;
    uint32_t open_count;
    uint32_t error_count;
    error_t last_error;
    bool is_initialized;
} device_info_t;

// Update device_t structure
typedef struct {
    char name[32];
    device_type_t type;
    uint32_t id;
    device_state_t state;
    uint32_t open_count;
    uint32_t error_count;
    error_t last_error;
    bool is_initialized;
    void* driver_data;
} device_t;

// Function declarations
void device_init(void);
device_t* device_register(const char* name, device_type_t type, void* driver_data);
error_t device_unregister(uint32_t device_id);
bool device_open(device_t* device);
bool device_close(device_t* device);
bool device_read(device_t* device, void* buffer, size_t size);
bool device_write(device_t* device, const void* buffer, size_t size);
bool device_ioctl(device_t* device, uint32_t request, void* arg);
void device_get_info(device_t* device, device_info_t* info);
void device_set_state(device_t* device, device_state_t state);
void device_set_error(device_t* device, error_t error);
bool device_power_on(device_t* device);
bool device_power_off(device_t* device);
bool device_reset(device_t* device);

#endif /* DEVICE_H */ 