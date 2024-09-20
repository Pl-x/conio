import subprocess

def install_packages(packages):
    for package in packages:
        try:
            subprocess.check_call(["sudo", "apt", "install", package])
            print(f"{package} installed successfully.")
        except subprocess.CalledProcessError as e:
            print(f"Error installing {package}: {e}")

if __name__ == "__main__":
    packages = [
        "net-tools",
        "git",
        "apache2",
        "openssh-server",
        "ufw",
        "iproute2",
        "mysql-server",
        "tree",
        "zip",
        "unzip",
        "tar",
        "redis-server",
        "fail2ban"
    ]

    install_packages(packages)
