#ifndef KERNEL_H
#define KERNEL_H

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

// Kernel version
#define KERNEL_VERSION "0.1.0"
#define KERNEL_NAME "SimpleOS"

// Memory management
#define PAGE_SIZE 4096
#define KERNEL_HEAP_START 0xC0000000
#define KERNEL_HEAP_END   0xC0400000
#define USER_HEAP_START   0x40000000
#define USER_HEAP_END     0x80000000

// Process management
#define MAX_PROCESSES 256
#define MAX_THREADS 1024
#define MAX_PRIORITY 10
#define DEFAULT_STACK_SIZE 8192
#define MAX_NAME_LENGTH 32

// File system
#define MAX_FILENAME_LENGTH 256
#define MAX_PATH_LENGTH 1024
#define MAX_OPEN_FILES 64
#define MAX_MOUNT_POINTS 16
#define MAX_DIRECTORY_ENTRIES 256

// Device management
#define MAX_DEVICES 32
#define MAX_DRIVERS 16

// Network
#define MAX_NETWORK_INTERFACES 4
#define MAX_SOCKETS 128
#define MAX_PACKET_SIZE 1514

// Interrupts
#define MAX_IRQS 16
#define MAX_ISRS 256

// System calls
#define MAX_SYSCALLS 256

// Error codes
typedef enum {
    ERR_NONE = 0,
    ERR_INVALID_ARGUMENT = -1,
    ERR_OUT_OF_MEMORY = -2,
    ERR_DEVICE_NOT_FOUND = -3,
    ERR_DEVICE_BUSY = -4,
    ERR_FILE_NOT_FOUND = -5,
    ERR_PERMISSION_DENIED = -6,
    ERR_INVALID_OPERATION = -7,
    ERR_TIMEOUT = -8,
    ERR_NETWORK_ERROR = -9,
    ERR_UNKNOWN = -255
} error_t;

// Process states
typedef enum {
    PROC_CREATED,
    PROC_READY,
    PROC_RUNNING,
    PROC_BLOCKED,
    PROC_SLEEPING,
    PROC_ZOMBIE,
    PROC_TERMINATED
} process_state_t;

// Thread states
typedef enum {
    THREAD_CREATED,
    THREAD_READY,
    THREAD_RUNNING,
    THREAD_BLOCKED,
    THREAD_SLEEPING,
    THREAD_TERMINATED
} thread_state_t;

// Thread structure
typedef struct {
    uint32_t tid;
    uint32_t pid;
    uint32_t stack_ptr;
    uint32_t stack_size;
    uint32_t priority;
    bool is_main;
} thread_t;

// Process structure
typedef struct {
    uint32_t pid;
    char name[MAX_NAME_LENGTH];
    process_state_t state;
    uint32_t priority;
    uint32_t stack_ptr;
    uint32_t stack_size;
    uint32_t heap_ptr;
    uint32_t heap_size;
    uint32_t parent_pid;
    uint32_t exit_code;
    uint32_t cpu_time;
    uint32_t memory_usage;
    void* entry_point;
    uint32_t creation_time;
    thread_t* thread;
} process_t;

// Process statistics structure
typedef struct {
    uint32_t total_processes;
    uint32_t running_processes;
    uint32_t blocked_processes;
    uint32_t sleeping_processes;
    uint32_t total_threads;
    uint32_t running_threads;
    uint32_t total_cpu_time;
    uint32_t total_memory_usage;
} process_stats_t;

// Forward declaration
typedef struct memory_block memory_block_t;

// Memory block structure
struct memory_block {
    uint32_t start;
    uint32_t size;
    bool is_free;
    memory_block_t* next;
};

// File types
typedef enum {
    FILE_TYPE_REGULAR,
    FILE_TYPE_DIRECTORY,
    FILE_TYPE_CHARDEV,
    FILE_TYPE_BLOCKDEV,
    FILE_TYPE_PIPE,
    FILE_TYPE_SYMLINK
} file_type_t;

// File open modes
typedef enum {
    FILE_MODE_READ,
    FILE_MODE_WRITE,
    FILE_MODE_APPEND
} file_mode_t;

// File seek modes
typedef enum {
    FILE_SEEK_SET,
    FILE_SEEK_CUR,
    FILE_SEEK_END
} file_seek_t;

// File info structure
typedef struct {
    char name[MAX_FILENAME_LENGTH];
    uint32_t size;
    file_type_t type;
    uint32_t permissions;
    uint32_t owner;
    uint32_t group;
    uint32_t created;
    uint32_t modified;
    uint32_t accessed;
    uint32_t creation_time;
    uint32_t modification_time;
    uint32_t access_time;
} file_info_t;

// Directory entry structure
typedef struct {
    char name[MAX_FILENAME_LENGTH];
    file_type_t type;
} directory_entry_t;

// Directory structure
typedef struct directory {
    char name[MAX_FILENAME_LENGTH];
    struct directory* parent;
    struct directory* first_child;
    struct directory* next;
} directory_t;

// Update file_t to include the expected members
typedef struct {
    int fd;
    char name[MAX_FILENAME_LENGTH];
    uint32_t size;
    file_type_t type;
    uint32_t permissions;
    uint32_t owner;
    uint32_t group;
    uint32_t created;
    uint32_t modified;
    uint32_t accessed;
    uint32_t position;
    void* data;
    uint32_t access_time;
    uint32_t modification_time;
    uint32_t creation_time;
} file_t;

// File system structures
typedef struct {
    char name[MAX_FILENAME_LENGTH];
    uint32_t size;
    uint32_t type;
    uint32_t permissions;
    uint32_t owner;
    uint32_t group;
    uint32_t created;
    uint32_t modified;
    uint32_t accessed;
} mount_point_t;

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

// Device structure
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

typedef struct {
    char name[32];
    uint32_t type;
    bool (*init)(device_t*);
    bool (*read)(device_t*, void*, size_t);
    bool (*write)(device_t*, const void*, size_t);
    bool (*ioctl)(device_t*, uint32_t, void*);
    bool (*close)(device_t*);
} driver_t;

// Network structures
typedef struct {
    char name[16];
    uint8_t mac[6];
    uint32_t ip;
    uint32_t netmask;
    uint32_t gateway;
    bool is_up;
} network_interface_t;

typedef struct {
    uint32_t local_port;
    uint32_t remote_port;
    uint32_t remote_ip;
    uint32_t protocol;
    bool is_connected;
} socket_t;

// Interrupt structures
typedef struct {
    uint32_t number;
    void (*handler)(void);
    bool is_installed;
} interrupt_handler_t;

// System call structure
typedef struct {
    uint32_t number;
    void* handler;
    const char* name;
} syscall_t;

// Function declarations
void kernel_init(void);
void kernel_panic(const char* message);
error_t process_create(const char* name, void* entry_point, uint32_t priority);
error_t process_terminate(uint32_t pid);
error_t thread_create(uint32_t pid, void* entry_point, uint32_t priority);
error_t thread_terminate(uint32_t tid);
void* memory_alloc(size_t size);
void memory_free(void* ptr);
error_t file_open(const char* path, uint32_t flags);
error_t file_close(uint32_t fd);
error_t file_read(uint32_t fd, void* buffer, size_t size);
error_t file_write(uint32_t fd, const void* buffer, size_t size);
error_t device_register(device_t* device);
error_t device_unregister(uint32_t device_id);
error_t network_interface_up(uint32_t if_index);
error_t network_interface_down(uint32_t if_index);
error_t socket_create(uint32_t protocol);
error_t socket_connect(uint32_t socket, uint32_t ip, uint32_t port);
error_t socket_send(uint32_t socket, const void* data, size_t size);
error_t socket_receive(uint32_t socket, void* buffer, size_t size);
error_t interrupt_install(uint32_t number, void (*handler)(void));
error_t interrupt_uninstall(uint32_t number);
error_t syscall_register(uint32_t number, void* handler, const char* name);

#endif // KERNEL_H 