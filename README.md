# Minecraft Version Downloader

A web-based tool to download any version of Minecraft directly from Mojang's servers. This tool provides a user-friendly interface to browse and download official Minecraft versions, including releases, snapshots, beta, and alpha versions.

## Features

- 🎮 Download any official Minecraft version
- 🔍 Search functionality to quickly find versions
- 🏷️ Filter by version type (Release, Snapshot, Beta, Alpha)
- 📊 Real-time download progress tracking
- 📦 Downloads include:
  - Client JAR file
  - All required libraries
  - Asset index
  - Game assets (textures, sounds, etc.)

## Usage

1. Visit the website
2. Browse or search for your desired Minecraft version
3. Click the "Download" button on the version card
4. Wait for the download to complete
5. Extract the downloaded ZIP file

The downloaded ZIP file will contain the complete Minecraft version with all necessary files in the correct directory structure.

## Deployment on GitHub Pages

1. Fork this repository
2. Go to your fork's Settings
3. Navigate to Pages under Settings
4. Under "Source", select "main" branch
5. Click Save
6. Your site will be available at `https://[your-username].github.io/[repository-name]/`

## Local Development

To run locally:

1. Clone the repository
2. Open the directory in your terminal
3. Start a local server:
   ```bash
   python -m http.server 8000
   ```
   or use any other local server of your choice
4. Visit `http://localhost:8000` in your browser

## Technical Details

- Uses Mojang's official APIs
- Downloads files directly from Mojang's servers
- No server-side code required (completely static)
- Built with vanilla JavaScript and Bootstrap
- Uses JSZip for creating ZIP files client-side

## Legal

This tool only downloads official Minecraft files from Mojang's servers. You still need a valid Minecraft account to play the game. This tool is not affiliated with Mojang or Microsoft. 