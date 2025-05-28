#ifndef SHELL_H
#define SHELL_H

typedef struct shell shell_t;

void shell_init(void);
shell_t* shell_create(const char* name);
void shell_set_current(shell_t* shell);
void shell_register_command(const char* name, void (*handler)(void), const char* desc);

void shell_command_help(void);
void shell_command_cd(void);
void shell_command_ls(void);
void shell_command_pwd(void);
void shell_command_echo(void);
void shell_command_clear(void);
void shell_command_exit(void);

extern shell_t* current_shell;

#endif
