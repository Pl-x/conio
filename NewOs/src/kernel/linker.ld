ENTRY(kernel_main)
OUTPUT_FORMAT("binary")
SECTIONS
{
    . = 0x1000;
    
    .text :
    {
        *(.text)
    }
    
    .rodata :
    {
        *(.rodata)
    }
    
    .data :
    {
        *(.data)
    }
    
    .bss :
    {
        *(.bss)
    }
} 