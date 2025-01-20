const db = new Dexie("documentsDatabase");
db.version(1).stores({
    documents: '++id,name,content_type,data,upload_date'
});

const searchInput = document.querySelector('.search-documents input');

searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    fetchDocuments(query);
});

async function fetchDocuments(query = '') {
    const documents = await db.documents.toArray();
    const filteredDocuments = documents.filter(doc => doc.name.toLowerCase().includes(query));

    documentsGrid.innerHTML = filteredDocuments.map((doc, index) => {
        const fileExtension = doc.name.split('.').pop().toLowerCase();
        const fileTypeIcons = {
            pdf: 'fas fa-file-pdf',
            png: 'fas fa-file-image',
            jpg: 'fas fa-file-image',
            jpeg: 'fas fa-file-image',
            doc: 'fas fa-file-word',
            docx: 'fas fa-file-word',
            txt: 'fas fa-file-alt',
            default: 'fas fa-file'
        };
        const fileTypeColors = {
            pdf: 'color-red',
            png: 'color-blue',
            jpg: 'color-yellow',
            jpeg: 'color-yellow',
            doc: 'color-green',
            docx: 'color-green',
            txt: 'color-gray',
            default: 'color-purple'
        };
        const iconClass = fileTypeIcons[fileExtension] || fileTypeIcons.default;
        const colorClass = fileTypeColors[fileExtension] || fileTypeColors.default;

        return `
        <div class="document-card">
            <i class="${iconClass}" style="${colorClass} font-size: 2.5rem; margin-bottom: 1rem;" onclick="previewDocument('${doc.name}', '${doc.content_type}', '${doc.data}')"></i>
            <h3 style="font-size: 0.79rem;">${doc.name}</h3>
            <p>Uploaded ${new Date(doc.upload_date).toLocaleDateString()}</p>
            <div class="document-actions">
                <button onclick="downloadDocument('${doc.name}', '${doc.content_type}', '${doc.data}')">
                    <i class="fas fa-download" style="color: #3498db; font-size: 1.2rem; margin-right: 0.2rem;"></i> 
                </button>
                <button onclick="emailShareDocument('${doc.name}', '${doc.content_type}', '${doc.data}')">
                    <i class="fas fa-share" style="color: #2ecc71; font-size: 1.2rem; margin-right: 0.2rem;"></i> 
                </button>
                <button onclick="deleteDocument(${doc.id})">
                    <i class="fas fa-trash" style="color: #e74c3c; font-size: 1.2rem; margin-right: 0.2rem;"></i> 
                </button>
            </div>
        </div>`;
    }).join('');
}

async function downloadDocument(name, contentType, base64Data) {
    const a = document.createElement('a');
    const blob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: contentType });
    const url = URL.createObjectURL(blob);

    a.href = url;
    a.download = name;
    a.click();

    URL.revokeObjectURL(url);
}

function emailShareDocument(name, contentType, base64Data) {
    const blob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: contentType });
    const url = URL.createObjectURL(blob);

    const subject = `Shared Document: ${name}`;
    const body = `Here is the document "${name}". You can download it using this link: ${url}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function deleteDocument(id) {
    if (confirm('Are you sure you want to delete this document?')) {
        await db.documents.delete(id);
        fetchDocuments();
    }
}

function previewDocument(name, contentType, base64Data) {
    const blob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    window.open(url);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

uploadButton.addEventListener('click', () => {
    documentInput.click();
});

documentInput.addEventListener('change', () => {
    const file = documentInput.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = async function (event) {
            const base64Data = event.target.result.split(',')[1];

            const document = {
                name: file.name,
                content_type: file.type,
                data: base64Data,
                upload_date: new Date().toISOString()
            };

            await db.documents.add(document);
            fetchDocuments();
        };

        reader.readAsDataURL(file);
    }
});

fetchDocuments();
