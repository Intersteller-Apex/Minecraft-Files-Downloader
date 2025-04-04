const VERSION_MANIFEST_URL = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json';
let versions = [];
let currentFilter = 'all';
let searchTerm = '';

// Initialize the page
async function init() {
    try {
        const response = await fetch(VERSION_MANIFEST_URL);
        const data = await response.json();
        versions = data.versions;
        renderVersions();
        setupEventListeners();
    } catch (error) {
        console.error('Failed to fetch versions:', error);
        alert('Failed to load Minecraft versions. Please try again later.');
    }
}

// Set up event listeners
function setupEventListeners() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        renderVersions();
    });

    // Filter buttons
    document.querySelectorAll('.btn-group button').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.btn-group button').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-filter');
            renderVersions();
        });
    });
}

// Render version cards
function renderVersions() {
    const grid = document.getElementById('versionGrid');
    grid.innerHTML = '';

    const filteredVersions = versions.filter(version => {
        const matchesSearch = version.id.toLowerCase().includes(searchTerm);
        const matchesFilter = currentFilter === 'all' || version.type === currentFilter;
        return matchesSearch && matchesFilter;
    });

    filteredVersions.forEach(version => {
        const card = createVersionCard(version);
        grid.appendChild(card);
    });
}

// Create a version card element
function createVersionCard(version) {
    const card = document.createElement('div');
    card.className = 'card version-card';
    
    const typeClass = {
        'release': 'bg-success',
        'snapshot': 'bg-warning',
        'old_beta': 'bg-info',
        'old_alpha': 'bg-secondary'
    }[version.type] || 'bg-primary';

    card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${version.id}</h5>
            <span class="badge ${typeClass}">${version.type}</span>
            <p class="card-text">
                Released: ${new Date(version.releaseTime).toLocaleDateString()}
            </p>
            <button class="btn btn-primary btn-sm download-btn">
                Download
            </button>
        </div>
    `;

    card.querySelector('.download-btn').addEventListener('click', () => {
        startDownload(version);
    });

    return card;
}

// Start the download process
async function startDownload(version) {
    try {
        // Show download status
        const statusDiv = document.querySelector('.download-status');
        const progressBar = statusDiv.querySelector('.progress-bar');
        const progressDiv = statusDiv.querySelector('.progress');
        const titleElement = document.getElementById('downloadTitle');
        const detailsElement = document.getElementById('downloadDetails');

        statusDiv.style.display = 'block';
        progressDiv.style.display = 'block';
        titleElement.textContent = `Downloading Minecraft ${version.id}`;

        // Get version manifest
        const versionManifest = await fetch(version.url).then(r => r.json());
        
        // Create a zip file
        const zip = new JSZip();
        
        // Download client.jar
        detailsElement.textContent = 'Downloading client.jar...';
        const clientJar = await fetch(versionManifest.downloads.client.url).then(r => r.blob());
        zip.file('client.jar', clientJar);

        // Download libraries
        detailsElement.textContent = 'Downloading libraries...';
        for (const lib of versionManifest.libraries) {
            if (lib.downloads?.artifact?.url) {
                const libPath = `libraries/${lib.downloads.artifact.path}`;
                const libData = await fetch(lib.downloads.artifact.url).then(r => r.blob());
                zip.file(libPath, libData);
            }
        }

        // Download assets index
        detailsElement.textContent = 'Downloading asset index...';
        const assetIndexData = await fetch(versionManifest.assetIndex.url).then(r => r.json());
        zip.file(`assets/indexes/${versionManifest.assetIndex.id}.json`, JSON.stringify(assetIndexData));

        // Download assets
        const totalAssets = Object.keys(assetIndexData.objects).length;
        let downloadedAssets = 0;

        for (const [assetPath, asset] of Object.entries(assetIndexData.objects)) {
            const hash = asset.hash;
            const hashPrefix = hash.substring(0, 2);
            const assetUrl = `https://resources.download.minecraft.net/${hashPrefix}/${hash}`;
            
            try {
                const assetData = await fetch(assetUrl).then(r => r.blob());
                zip.file(`assets/objects/${hashPrefix}/${hash}`, assetData);
                
                downloadedAssets++;
                const progress = Math.round((downloadedAssets / totalAssets) * 100);
                progressBar.style.width = `${progress}%`;
                progressBar.textContent = `${progress}%`;
                detailsElement.textContent = `Downloading assets... (${downloadedAssets}/${totalAssets})`;
            } catch (error) {
                console.error(`Failed to download asset ${assetPath}:`, error);
            }
        }

        // Generate zip file
        detailsElement.textContent = 'Generating zip file...';
        const content = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 5 }
        });

        // Create download link
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `minecraft-${version.id}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Reset UI
        statusDiv.style.display = 'none';
        progressDiv.style.display = 'none';
        titleElement.textContent = 'Download Complete!';
        detailsElement.textContent = '';

    } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again.');
    }
}

// Load JSZip library
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
document.head.appendChild(script);

// Initialize when page loads
window.addEventListener('load', init); 