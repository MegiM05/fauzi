const kelompokColors = [
    { bg: 'rgba(243, 156, 18, 0.2)', text: '#f39c12', border: 'rgba(243, 156, 18, 0.5)' },
    { bg: 'rgba(46, 204, 113, 0.2)', text: '#2ecc71', border: 'rgba(46, 204, 113, 0.5)' },
    { bg: 'rgba(155, 89, 182, 0.2)', text: '#9b59b6', border: 'rgba(155, 89, 182, 0.5)' },
    { bg: 'rgba(52, 152, 219, 0.2)', text: '#3498db', border: 'rgba(52, 152, 219, 0.5)' },
    { bg: 'rgba(231, 76, 60, 0.2)', text: '#e74c3c', border: 'rgba(231, 76, 60, 0.5)' },
    { bg: 'rgba(26, 188, 156, 0.2)', text: '#1abc9c', border: 'rgba(26, 188, 156, 0.5)' }
];

// Fungsi untuk memuat data dengan error handling yang lebih baik
async function loadData() {
    try {
        console.log('Mencoba memuat data dari database/nama.json...');
        const response = await fetch('nama.json');
        
        if (!response.ok) {
            throw new Error(`Gagal memuat data. Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data berhasil dimuat:', data);
        
        // Validasi struktur data
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
            throw new Error('Format data tidak valid. Harus berupa object dengan kelompok sebagai key');
        }
        
        return data;
    } catch (error) {
        console.error('Error dalam loadData:', error);
        
        // Tampilkan pesan error ke UI
        const container = document.getElementById('guru-container');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <p>Gagal memuat data: ${error.message}</p>
                    <button onclick="window.location.reload()">Coba Lagi</button>
                </div>
            `;
        }
        
        return null;
    }
}

// Fungsi untuk membuat tombol filter
function generateFilterButtons(kelompokList) {
    const container = document.getElementById('filter-buttons');
    if (!container) {
        console.error('Element filter-buttons tidak ditemukan');
        return;
    }

    container.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = 'Semua';
    allBtn.dataset.filter = 'all';
    container.appendChild(allBtn);

    kelompokList.forEach((kelompok, index) => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = `Kelompok ${index + 1}`;
        btn.dataset.filter = kelompok;
        container.appendChild(btn);
    });
}

// Fungsi untuk menampilkan data guru
async function displayData(filter = 'all') {
    const container = document.getElementById('guru-container');
    if (!container) {
        console.error('Element guru-container tidak ditemukan');
        return;
    }

    container.innerHTML = '<div class="loading-state">Memuat data...</div>';
    
    try {
        const data = await loadData();
        
        if (!data) {
            throw new Error('Data tidak tersedia');
        }

        container.innerHTML = '';
        
        if (filter === 'all') {
            // Tampilkan semua kelompok
            Object.entries(data).forEach(([kelompok, guruList], index) => {
                const colorIndex = index % kelompokColors.length;

                // Judul kelompok
                const title = document.createElement('h2');
                title.className = 'group-title';
                title.textContent = `Kelompok ${index + 1}`;
                container.appendChild(title);
                
                // Kartu guru
                guruList.forEach(guru => {
                    if (!guru.nama || !guru.jabatan) {
                        console.warn('Data guru tidak lengkap:', guru);
                        return;
                    }

                    const card = document.createElement('div');
                    card.className = 'guru-card';
                    card.innerHTML = `
                        <div class="guru-nama">${guru.nama}</div>
                        <div class="guru-jabatan">${guru.jabatan}</div>
                        <div class="guru-kelompok kelompok-${index + 1}" 
                             style="--bg-color: ${kelompokColors[colorIndex].bg}; 
                                    --text-color: ${kelompokColors[colorIndex].text};
                                    --border-color: ${kelompokColors[colorIndex].border}">
                            Kelompok ${index + 1}
                        </div>
                    `;
                    container.appendChild(card);
                });
            });
        } else {
            // Tampilkan kelompok spesifik
            const keys = Object.keys(data);
            const kelompokIndex = keys.indexOf(filter);
            
            if (kelompokIndex === -1) {
                throw new Error(`Kelompok ${filter} tidak ditemukan`);
            }

            const colorIndex = kelompokIndex % kelompokColors.length;

            const title = document.createElement('h2');
            title.className = 'group-title';
            title.textContent = `Kelompok ${kelompokIndex + 1}`;
            container.appendChild(title);
            
            data[filter].forEach(guru => {
                if (!guru.nama || !guru.jabatan) {
                    console.warn('Data guru tidak lengkap:', guru);
                    return;
                }

                const card = document.createElement('div');
                card.className = 'guru-card';
                card.innerHTML = `
                    <div class="guru-nama">${guru.nama}</div>
                    <div class="guru-jabatan">${guru.jabatan}</div>
                    <div class="guru-kelompok kelompok-${kelompokIndex + 1}"
                         style="--bg-color: ${kelompokColors[colorIndex].bg}; 
                                --text-color: ${kelompokColors[colorIndex].text};
                                --border-color: ${kelompokColors[colorIndex].border}">
                        Kelompok ${kelompokIndex + 1}
                    </div>
                `;
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error dalam displayData:', error);
        container.innerHTML = `
            <div class="error-state">
                <p>Terjadi kesalahan: ${error.message}</p>
                <button onclick="window.location.reload()">Coba Lagi</button>
            </div>
        `;
    }
}

// Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM siap, memulai inisialisasi...');
    
    try {
        const data = await loadData();
        
        if (data) {
            console.log('Data diterima, membuat tombol filter...');
            generateFilterButtons(Object.keys(data));
            
            // Event listener untuk tombol filter
            const filterContainer = document.getElementById('filter-buttons');
            if (filterContainer) {
                filterContainer.addEventListener('click', function(e) {
                    if (e.target.classList.contains('filter-btn')) {
                        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                        e.target.classList.add('active');
                        displayData(e.target.dataset.filter);
                    }
                });
            }
            
            // Tampilan awal
            displayData();
        }
    } catch (error) {
        console.error('Error dalam inisialisasi:', error);
    }
});
