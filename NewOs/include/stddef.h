#ifndef _STDDEF_H
#define _STDDEF_H

typedef unsigned long size_t;
typedef signed long ssize_t;
typedef signed long ptrdiff_t;
typedef unsigned long wchar_t;

#define NULL ((void*)0)
#define offsetof(type, member) ((size_t) &((type *)0)->member)

#endif /* _STDDEF_H */ 