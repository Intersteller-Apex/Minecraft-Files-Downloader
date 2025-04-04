import requests
import json
import os
from pathlib import Path
import sys

def download_file(url, path):
    """Download a file from url to path"""
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    path.parent.mkdir(parents=True, exist_ok=True)
    
    total_size = int(response.headers.get('content-length', 0))
    block_size = 1024  # 1 KB
    
    print(f"Downloading {path.name}...")
    
    with open(path, 'wb') as f:
        if total_size == 0:
            f.write(response.content)
        else:
            downloaded = 0
            for data in response.iter_content(block_size):
                downloaded += len(data)
                f.write(data)
                done = int(50 * downloaded / total_size)
                sys.stdout.write(f"\r[{'=' * done}{' ' * (50-done)}] {downloaded}/{total_size} bytes")
                sys.stdout.flush()
    print()

def get_version_manifest():
    """Get the version manifest from Mojang"""
    url = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

def find_version(manifest, version_id):
    """Find a specific version in the manifest"""
    for version in manifest['versions']:
        if version['id'] == version_id:
            return version
    return None

def download_minecraft_version(version_id):
    """Download a specific Minecraft version"""
    # Create base directory
    base_dir = Path(f"minecraft-{version_id}")
    
    print(f"Starting download of Minecraft {version_id}")
    
    # Get version manifest
    manifest = get_version_manifest()
    version_info = find_version(manifest, version_id)
    
    if not version_info:
        print(f"Version {version_id} not found!")
        print("Available versions:")
        for version in manifest['versions']:
            print(f"- {version['id']} ({version['type']})")
        return
    
    # Download version json
    version_json_url = version_info['url']
    version_json = requests.get(version_json_url).json()
    
    # Download client jar
    client_url = version_json['downloads']['client']['url']
    client_path = base_dir / "client.jar"
    download_file(client_url, client_path)
    
    # Download libraries
    for library in version_json['libraries']:
        if 'downloads' in library and 'artifact' in library['downloads']:
            lib_info = library['downloads']['artifact']
            lib_path = base_dir / "libraries" / lib_info['path']
            download_file(lib_info['url'], lib_path)
    
    # Download assets index
    assets_info = version_json['assetIndex']
    assets_index_path = base_dir / "assets" / "indexes" / f"{assets_info['id']}.json"
    download_file(assets_info['url'], assets_index_path)
    
    # Download assets
    assets_json = requests.get(assets_info['url']).json()
    for asset_name, asset_info in assets_json['objects'].items():
        hash_prefix = asset_info['hash'][:2]
        asset_url = f"https://resources.download.minecraft.net/{hash_prefix}/{asset_info['hash']}"
        asset_path = base_dir / "assets" / "objects" / hash_prefix / asset_info['hash']
        download_file(asset_url, asset_path)
    
    print(f"\nDownload complete! Files are in {base_dir}")

def main():
    print("Minecraft Version Downloader")
    print("---------------------------")
    
    # Get version manifest to show available versions
    manifest = get_version_manifest()
    print("\nLatest versions:")
    print(f"Release: {manifest['latest']['release']}")
    print(f"Snapshot: {manifest['latest']['snapshot']}")
    
    version = input("\nEnter Minecraft version to download (e.g. 1.20.4): ")
    download_minecraft_version(version.strip())

if __name__ == "__main__":
    main() 