import { NewsArticle, NewsCategory } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, setDoc, doc, serverTimestamp, query } from 'firebase/firestore';
import { ReaderAlgorithm } from './readerAlgorithm';

export const INITIAL_DETIK_HEADLINES: NewsArticle[] = [
  {
    id: 'detik-hl-01',
    title: 'detikNews: Sidang Paripurna DPR Sahkan Reformasi Kebijakan Energi Bersih & Tata Kelola Digital Nasional',
    description: 'DPR RI resmi mengesahkan paket regulasi strategis mencakup insentif energi terbarukan dan perlindungan infrastruktur komputasi kedaulatan data nasional.',
    content: `JAKARTA (detikcom) — Dewan Perwakilan Rakyat Republik Indonesia (DPR RI) dalam rapat paripurna hari ini secara bulat menyetujui pengesahan undang-undang strategis baru mengenai akselerasi transisi energi bersih dan tata kelola kedaulatan data digital nasional.

Ketua DPR menegaskan bahwa regulasi ini dirancang untuk menjawab tantangan dekarbonisasi industri sekaligus memberikan kepastian hukum bagi iklim investasi teknologi tinggi, termasuk pembangunan pusat data hijau di berbagai kawasan ekonomi khusus.

"Langkah ini bukan sekadar penyesuaian hukum biasa, melainkan cetak biru kedaulatan energi dan teknologi Indonesia dalam menghadapi kompetisi global dekade ini," ujar pimpinan sidang di Gedung Nusantara, Kompleks Parlemen, Senayan, Jakarta.

Kementerian terkait menyatakan regulasi turunan akan segera diterbitkan dalam kurun waktu 30 hari ke depan untuk memastikan implementasi yang terukur.`,
    url: 'https://news.detik.com',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    source: 'detikcom',
    category: 'politics',
    publishedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    author: 'Tim Redaksi detikNews',
    readingTime: 4,
    isTrending: true,
    trendingScore: 99,
    commentsCount: 38,
    isDetikHeadline: true,
    detikChannel: 'detikNews',
    keywords: ['dpr', 'kebijakan', 'energi bersih', 'pemerintah', 'regulasi']
  },
  {
    id: 'detik-hl-02',
    title: 'detikFinance: IHSG Reli Menembus Rekor Baru, Arus Modal Masuk Saham Perbankan dan EBT',
    description: 'Sentimen surplus neraca dagang dan masuknya konsorsium investasi global membawa IHSG melonjak menembus level psikologis tertinggi tahun ini.',
    content: `JAKARTA (detikcom) — Indeks Harga Saham Gabungan (IHSG) Bursa Efek Indonesia (BEI) mencatatkan kenaikan spektakuler pada penutupan sesi perdagangan hari ini. Penguatan didorong oleh gelombang pembelian bersih (net buy) investor asing yang membukukan triliunan rupiah di sektor perbankan, teknologi finansial, dan energi terbarukan.

Berdasarkan data perdagangan bursa, volume transaksi melonjak tajam dibanding rata-rata harian kuartal sebelumnya.

Analis pasar modal detikFinance memaparkan: "Fundamental ekonomi domestik yang kokoh serta stabilitas nilai tukar Rupiah memberikan rasa percaya diri ekstra bagi manajer investasi global untuk menempatkan dana jangka panjang di pasar modal kita."`,
    url: 'https://finance.detik.com',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    source: 'detikcom',
    category: 'business',
    publishedAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    author: 'Tim detikFinance',
    readingTime: 3,
    isTrending: true,
    trendingScore: 96,
    commentsCount: 29,
    isDetikHeadline: true,
    detikChannel: 'detikFinance',
    keywords: ['ihsg', 'saham', 'investasi', 'keuangan', 'finansial', 'bank']
  },
  {
    id: 'detik-hl-03',
    title: 'detikInet: Era AI Edge di Smartphone, Komputasi Pintar Tanpa Ketergantungan Server Cloud',
    description: 'Produsen teknologi terkemuka mulai merilis perangkat keras dengan NPU terdedikasi yang mampu menjalankan model bahasa miliaran parameter secara mandiri.',
    content: `JAKARTA (detikcom) — Inovasi kecerdasan buatan (AI) kini bergeser dari cloud computing terpusat menuju komputasi lokal di dalam genggaman (Edge AI). Generasi ponsel pintar flagship terbaru menghadirkan unit pemrosesan neural (NPU) generasi ke-4 yang mampu menjalankan perintah analitik, transkripsi real-time, dan pemodelan generatif tanpa koneksi internet.

Para pengamat teknologi detikInet menilai terobosan ini mengatasi dua kendala utama adopsi AI: latensi transmisi jaringan dan keamanan privasi data konsumen. Seluruh data tetap tersimpan secara aman di dalam enclave silikon perangkat pengguna.`,
    url: 'https://inet.detik.com',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    source: 'detikcom',
    category: 'technology',
    publishedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    author: 'Tim detikInet',
    readingTime: 3,
    isTrending: true,
    trendingScore: 94,
    commentsCount: 45,
    isDetikHeadline: true,
    detikChannel: 'detikInet',
    keywords: ['ai', 'teknologi', 'smartphone', 'gadget', 'chipset', 'cloud']
  },
  {
    id: 'detik-hl-04',
    title: 'detikSport: Kemenangan Heroik di All England Mengukuhkan Dominasi Bulutangkis Indonesia',
    description: 'Ganda putra Indonesia sukses menumbangkan juara bertahan dalam rubber game mendebarkan di Utilita Arena Birmingham.',
    content: `BIRMINGHAM (detikcom) — Lagu Indonesia Raya kembali berkumandang megah di Utilita Arena Birmingham setelah pasangan ganda putra andalan Merah Putih sukses menyabet gelar juara All England.

Pertandingan final yang berlangsung selama 88 menit diwarnai saling susul angka dan reli pertahanan luar biasa. Kemenangan ini memperpanjang catatan impresif supremasi bulutangkis Indonesia di panggung turnamen tertua dunia.

"Gelar ini kami persembahkan untuk seluruh masyarakat Indonesia yang tiada henti memberikan doa dan dukungan," ujar sang atlet saat wawancara pasca-laga detikSport.`,
    url: 'https://sport.detik.com',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
    source: 'detikcom',
    category: 'sports',
    publishedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    author: 'Tim detikSport',
    readingTime: 3,
    isTrending: true,
    trendingScore: 91,
    commentsCount: 52,
    isDetikHeadline: true,
    detikChannel: 'detikSport',
    keywords: ['bulutangkis', 'all england', 'olahraga', 'badminton', 'juara']
  },
  {
    id: 'detik-hl-05',
    title: 'detikHot: Film Sci-Fi Epik Karya Sutradara Indonesia Tembus Nominasi Festival Internasional',
    description: 'Produksi berteknologi visual effects mutakhir yang mengadaptasi mitologi nusantara mendapatkan standing ovation dari kritikus sinema dunia.',
    content: `JAKARTA (detikcom) — Industri perfilman tanah air menorehkan prestasi gemilang di kancah internasional. Karya sinema fiksi ilmiah terbaru garapan sineas lokal resmi masuk jajaran kompetisi utama festival film terkemuka Eropa.

Film berdurasi 145 menit ini memadukan estetika futuristik dengan filosofi kearifan lokal. Kritikus memuji detail visual effect dan aransemen musik orkestra yang dieksekusi dengan standar sinematografi kelas dunia.`,
    url: 'https://hot.detik.com',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    source: 'detikcom',
    category: 'entertainment',
    publishedAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    author: 'Tim detikHot',
    readingTime: 3,
    isTrending: false,
    trendingScore: 86,
    commentsCount: 18,
    isDetikHeadline: true,
    detikChannel: 'detikHot',
    keywords: ['film', 'sinema', 'hiburan', 'festival', 'aktor']
  },
  {
    id: 'detik-hl-06',
    title: 'detikHealth: Riset Imunologi Klinis Nasional Ungkap Efektivitas Terapi Sel Target',
    description: 'Uji klinis multi-senter di rumah sakit pendidikan menunjukkan terobosan menjanjikan dalam penanganan penyakit autoimun resistan.',
    content: `SURABAYA (detikcom) — Konsorsium peneliti medis dari universitas negeri ternama merilis temuan mutakhir terapi biologis presisi untuk menangani gangguan autoimun kronis.

Metode ini menggunakan antibodi monoklonal spesifik yang dirancang melumpuhkan molekul peradangan tanpa menekan sistem kekebalan tubuh pasien secara umum. Hasil evaluasi fase klinis mencatat tingkat toleransi pasien yang sangat tinggi.`,
    url: 'https://health.detik.com',
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
    source: 'detikcom',
    category: 'science',
    publishedAt: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
    author: 'Tim detikHealth',
    readingTime: 4,
    isTrending: false,
    trendingScore: 88,
    commentsCount: 15,
    isDetikHeadline: true,
    detikChannel: 'detikHealth',
    keywords: ['kesehatan', 'medis', 'imunologi', 'sains', 'penelitian']
  }
];

export const INITIAL_CONTRIBUTOR_ARTICLES: NewsArticle[] = [
  {
    id: 'art-contrib-01',
    title: 'Liputan Warga: Bank Sampah Mandiri & PLTS Atap Kampung Sukamaju Raih Predikat Komunitas Lestari Mandiri',
    description: 'Inisiatif swadaya warga berhasil mendaur ulang 85% limbah rumah tangga dan memangkas tagihan listrik fasilitas umum hingga nihil dengan tenaga surya.',
    content: `SURABAYA — Warga RW 08 Kampung Sukamaju berhasil membuktikan bahwa aksi nyata kelestarian lingkungan dapat berawal dari komunitas akar rumput. Dalam kurun waktu dua tahun terakhir, kampung ini mengoperasikan sistem bank sampah digital dan instalasi panel surya (PLTS Atap) terdesentralisasi yang didanai secara patungan warga.

Ketua paguyuban warga, Ibu Tri Wahyuni, menuturkan: "Awalnya kami hanya memilah sampah organik untuk kompos dan plastik untuk kerajinan. Sekarang dengan timbangan digital dan tabungan bank sampah, warga bisa menukar poin daur ulang menjadi saldo listrik dan sembako bulanan."

Selain menyelesaikan problem sanitasi lingkungan, listrik surya yang dipasang di balai warga dan penerangan gang mampu beroperasi mandiri tanpa membebani kas RT. Inisiatif mandiri ini kini menjadi rujukan studi tiru berbagai komunitas dari kota tetangga.`,
    url: 'https://infocepat.portal/berita/kontributor-sukamaju',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    source: 'Kabar Komunitas (Kontributor)',
    category: 'contributor',
    publishedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    author: 'Tri Wahyuni (Kontributor Warga Surabaya)',
    authorId: 'contrib-tri-01',
    isContributor: true,
    readingTime: 3,
    isTrending: true,
    trendingScore: 97,
    commentsCount: 24,
    keywords: ['komunitas', 'lingkungan', 'bank sampah', 'energi mandiri', 'warga']
  },
  {
    id: 'art-contrib-02',
    title: 'Jurnalisme Komunitas: Revitalisasi Pasar Tradisional Berbasis QRIS di Boyolali Dongkrak Transaksi Petani 40%',
    description: 'Pedagang sayur mayur dan pedagang pasar tradisional kini menikmati kemudahan pembayaran instan, pencatatan kas otomatis, dan bebas pungli.',
    content: `BOYOLALI — Transformasi transaksi non-tunai kian merasuk ke denyut nadi perekonomian rakyat kecil. Di Pasar Sayur Cepogo, Boyolali, Jawa Tengah, lebih dari 180 pedagang pasar tradisional kini kompak menggunakan QRIS untuk melayani pembeli grosir maupun eceran.

Inisiatif ini dirintis oleh paguyuban pedagang muda yang mendampingi para pedagang sepuh membuka rekening bank dan memahami keamanan transaksi digital.

"Dulu sering kerepotan cari uang kembalian atau resiko uang palsu. Sekarang pembeli dari kota tinggal scan, uang langsung masuk dompet pedagang. Petani sayur juga lebih tenang karena catatan penjualannya rapi," jelas Mas Danang, pegiat ekonomi desa setempat.`,
    url: 'https://infocepat.portal/berita/kontributor-pasar-qris',
    imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80',
    source: 'Jurnalis Warga (Kontributor)',
    category: 'contributor',
    publishedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 mins ago
    author: 'Danang Prasetyo (Kontributor Boyolali)',
    authorId: 'contrib-danang-02',
    isContributor: true,
    readingTime: 3,
    isTrending: false,
    trendingScore: 89,
    commentsCount: 16,
    keywords: ['umkm', 'pasar tradisional', 'qris', 'petani', 'ekonomi desa']
  },
  {
    id: 'art-contrib-03',
    title: 'Liputan Investigasi Kontributor: Restorasi Hutan Mangrove Pesisir Muara Gembong Hadang Abrasi Laut Jawa',
    description: 'Kelompok nelayan dan pemuda pesisir menanam 50.000 bibit bakau, membentengi tambak dari rob tahunan sekaligus memulihkan habitat kepiting bakau.',
    content: `BEKASI — Di garis terluar pesisir Muara Gembong, perlawanan terhadap ancaman rob dan kenaikan air laut digerakkan oleh kegigihan nelayan lokal. Melalui gerakan restorasi swadaya, hamparan tambak yang sempat tenggelam kini kembali hijau oleh jalinan akar mangrove jenis Rhizophora dan Avicennia.

Koordinator relawan mangrove menuturkan bahwa hutan bakau yang mulai rimbun kini mengundang kembali burung kuntul putih, kepiting bakau, dan ikan belanak yang sempat menghilang.

"Kami tidak bisa hanya pasrah menunggu daratan kami habis terkikis abrasi. Setiap akhir pekan, anak-anak muda berkumpul menancapkan ajir dan menanam bibit. Menjaga pesisir adalah menjaga masa depan anak cucu kami," ungkapnya dengan bangga.`,
    url: 'https://infocepat.portal/berita/kontributor-mangrove-muaragembong',
    imageUrl: 'https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=1200&q=80',
    source: 'Kabar Nelayan Pesisir (Kontributor)',
    category: 'contributor',
    publishedAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(), // 48 mins ago
    author: 'Ahmad Faisal (Kontributor Bekasi)',
    authorId: 'contrib-faisal-03',
    isContributor: true,
    readingTime: 4,
    isTrending: false,
    trendingScore: 85,
    commentsCount: 12,
    keywords: ['mangrove', 'pesisir', 'abrasi', 'nelayan', 'lingkungan']
  }
];

export const INITIAL_GLOBAL_ARTICLES: NewsArticle[] = [
  {
    id: 'art-world-01',
    title: 'KTT Iklim Global Sepakati Dana Transisi Energi Terbarukan Senilai $100 Miliar',
    description: 'Para pemimpin dunia dari 190 negara meratifikasi kesepakatan bersejarah untuk mempercepat adopsi energi surya dan angin di negara berkembang.',
    content: `GENEWA — Dalam penutupan Konferensi Perubahan Iklim Dunia hari ini, delegasi dari lebih dari 190 negara berhasil mencapai konsensus penting mengenai pembentukan Dana Transisi Energi Berkelanjutan senilai $100 miliar.

Dana ini difokuskan untuk membantu negara-negara berkembang beralih dari energi fosil ke sumber energi baru dan terbarukan (EBT), termasuk tenaga surya skala utilitas, pembangkit angin lepas pantai, dan modernisasi jaringan transmisi cerdas (smart grid).

Sekretaris Jenderal menyatakan: "Ini adalah langkah konkret yang ditunggu generasi mendatang. Waktu untuk sekadar berwacana telah berakhir; sekarang adalah era eksekusi dan pendanaan nyata."`,
    url: 'https://www.reuters.com',
    imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
    source: 'Reuters Global',
    category: 'world',
    publishedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    author: 'Elena Vance',
    readingTime: 4,
    isTrending: true,
    trendingScore: 92,
    commentsCount: 14,
    keywords: ['iklim', 'energi', 'global', 'pbb']
  },
  {
    id: 'art-sci-01',
    title: 'Teleskop Luar Angkasa Deteksi Tanda Atmosfer Kaya Uap Air di Exoplanet Terdekat',
    description: 'Penemuan astronomi spektakuler di sistem bintang berjarak 40 tahun cahaya membuka cakrawala baru riset kelayakhunian planet luar tata surya.',
    content: `BALTIMORE — Data spektroskopi inframerah terbaru yang dikirimkan oleh teleskop observatorium luar angkasa mengonfirmasi adanya keberadaan uap air dan karbon dioksida di atmosfer exoplanet berbatu yang mengorbit di zona layak huni bintang induknya.

Tim ilmuwan astrobiologi internasional menyatakan bahwa kondisi atmosfer planet ini menunjukkan stabilitas iklim yang menarik untuk diteliti lebih intensif.`,
    url: 'https://nasa.gov',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    source: 'AstroNova Journal',
    category: 'science',
    publishedAt: new Date(Date.now() - 130 * 60 * 1000).toISOString(),
    author: 'Dr. Aris Munandar',
    readingTime: 4,
    isTrending: false,
    trendingScore: 84,
    commentsCount: 19,
    keywords: ['astronomi', 'luar angkasa', 'planet', 'sains']
  },
  {
    id: 'art-tech-02',
    title: 'Robot Humanoid Medis Pertama Mulai Bertugas di Rumah Sakit Rujukan Nasional',
    description: 'Teknologi robotik otonom membantu sterilisasi ruang operasi, distribusi obat presisi, dan pemantauan tanda vital pasien secara real-time.',
    content: `TOKYO — Rumah sakit rujukan terkemuka mengumumkan integrasi 20 unit robot asisten medis cerdas dalam operasional harian mereka.

Robot yang dilengkapi sensor lidar, kamera multispektral, dan navigasi AI mampu bernavigasi secara aman di koridor rumah sakit yang padat serta meringankan beban perawat dalam tugas-tugas logistik berulang.`,
    url: 'https://wired.com',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    source: 'Robotics & Future Tech',
    category: 'technology',
    publishedAt: new Date(Date.now() - 160 * 60 * 1000).toISOString(),
    author: 'Kenji Sato',
    readingTime: 4,
    isTrending: false,
    trendingScore: 87,
    commentsCount: 22,
    keywords: ['robotik', 'ai', 'medis', 'otomatisasi']
  }
];

export class NewsService {
  // Combine Contributor news, Detik.com headlines, and Global feeds, sorted by airtime timestamp
  private static articles: NewsArticle[] = [
    ...INITIAL_CONTRIBUTOR_ARTICLES,
    ...INITIAL_DETIK_HEADLINES,
    ...INITIAL_GLOBAL_ARTICLES
  ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  private static initializedFirestore = false;

  public static async initFirestoreArticles(): Promise<void> {
    try {
      const q = query(collection(db, 'articles'));
      const snap = await getDocs(q);
      const dbArticles: NewsArticle[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        dbArticles.push({
          id: docSnap.id,
          title: data.title,
          description: data.description,
          content: data.content,
          url: data.url || window.location.origin + '?article=' + docSnap.id,
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
          source: data.source || 'Kontributor Terverifikasi',
          category: data.category || 'contributor',
          author: data.author || 'Kontributor',
          authorId: data.authorId,
          isContributor: data.isContributor ?? (data.category === 'contributor' || !!data.authorId),
          readingTime: data.readingTime || 3,
          publishedAt: data.publishedAt || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
          commentsCount: data.commentsCount || 0,
          isDetikHeadline: data.isDetikHeadline || false,
          detikChannel: data.detikChannel,
          keywords: data.keywords || []
        });
      });

      if (dbArticles.length > 0) {
        const existingIds = new Set(this.articles.map(a => a.id));
        const newOnes = dbArticles.filter(a => !existingIds.has(a.id));
        // Sort chronologically by airtime (jam tayang) from all sources
        this.articles = [...newOnes, ...this.articles].sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      }
      this.initializedFirestore = true;
    } catch (err) {
      console.warn('Could not fetch Firestore articles:', err);
    }
  }

  /**
   * Retrieves articles with priority for contributor breaking news, Detik.com headlines, and reader algorithm personalization
   */
  public static async getArticles(
    category: NewsCategory | 'detikcom' = 'all', 
    searchQuery: string = ''
  ): Promise<NewsArticle[]> {
    if (!this.initializedFirestore) {
      await this.initFirestoreArticles();
    }

    let list = [...this.articles];

    // Filter specifically by Detik.com or Contributor
    if (category === 'detikcom') {
      list = list.filter(item => item.isDetikHeadline || item.source.toLowerCase().includes('detik'));
    } else if (category === 'contributor') {
      list = list.filter(item => 
        item.category === 'contributor' || 
        item.isContributor || 
        !!item.authorId ||
        item.source.toLowerCase().includes('kontributor')
      );
    } else if (category !== 'all') {
      list = list.filter(item => item.category === category);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.author?.toLowerCase().includes(q) ||
        item.detikChannel?.toLowerCase().includes(q)
      );
    }

    // Apply Reader Algorithm & Priority Ranking
    return ReaderAlgorithm.rankArticles(list);
  }

  public static getTrendingArticles(): NewsArticle[] {
    return this.articles
      .filter(a => a.isTrending || a.isDetikHeadline || a.isContributor || (a.trendingScore && a.trendingScore > 85))
      .sort((a, b) => {
        // Prioritize newest trending items
        return (b.trendingScore || 0) - (a.trendingScore || 0);
      });
  }

  public static getArticleById(id: string): NewsArticle | undefined {
    return this.articles.find(a => a.id === id);
  }

  public static async publishContributorArticle(params: {
    title: string;
    description: string;
    content: string;
    imageUrl: string;
    source: string;
    category: NewsCategory;
    author: string;
    authorId: string;
    readingTime?: number;
  }): Promise<NewsArticle> {
    const newId = `art-c-${Date.now()}`;
    const newArticle: NewsArticle = {
      id: newId,
      title: params.title,
      description: params.description,
      content: params.content,
      url: window.location.origin + '?article=' + newId,
      imageUrl: params.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      source: params.source || `Kontributor ${params.author}`,
      category: params.category || 'contributor',
      author: params.author,
      authorId: params.authorId,
      isContributor: true,
      readingTime: params.readingTime || Math.ceil(params.content.split(' ').length / 180) || 3,
      publishedAt: new Date().toISOString(), // Brand new airtime right now
      commentsCount: 0,
      keywords: params.title.toLowerCase().split(' ').filter(w => w.length > 3)
    };

    try {
      await setDoc(doc(db, 'articles', newId), {
        ...newArticle,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('Saving article to Firestore notice:', e);
    }

    // Insert at the very top (index 0) so it airs at the top of the portal in real time
    this.articles.unshift(newArticle);
    return newArticle;
  }

  /**
   * Fetch Live Headline Feeds directly from detik.com official RSS
   */
  public static async fetchDetikHeadlines(): Promise<NewsArticle[]> {
    const detikRssUrls = [
      'https://rss.detik.com/index.php/detikcom',
      'https://rss.detik.com/index.php/detikcom/news',
      'https://rss.detik.com/index.php/detikcom/finance',
      'https://rss.detik.com/index.php/detikcom/inet'
    ];

    const targetUrl = detikRssUrls[0];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.contents) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
          const items = xmlDoc.querySelectorAll('item');

          const parsedDetik: NewsArticle[] = [];
          items.forEach((item, index) => {
            if (index >= 10) return;
            const title = item.querySelector('title')?.textContent || '';
            const link = item.querySelector('link')?.textContent || 'https://www.detik.com';
            const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
            const description = item.querySelector('description')?.textContent?.replace(/<[^>]+>/g, '').trim() || title;

            // Extract media or fallback to high quality category image
            const enclosure = item.querySelector('enclosure')?.getAttribute('url');
            
            // Map channel/category based on title or content
            let cat: NewsCategory = 'politics';
            let channel = 'detikNews';
            const tLower = title.toLowerCase();

            if (tLower.includes('bisnis') || tLower.includes('ihsg') || tLower.includes('saham') || tLower.includes('rupiah') || tLower.includes('ekonomi')) {
              cat = 'business';
              channel = 'detikFinance';
            } else if (tLower.includes('ai') || tLower.includes('chip') || tLower.includes('gadget') || tLower.includes('game') || tLower.includes('teknologi')) {
              cat = 'technology';
              channel = 'detikInet';
            } else if (tLower.includes('bola') || tLower.includes('sport') || tLower.includes('bulutangkis') || tLower.includes('timnas')) {
              cat = 'sports';
              channel = 'detikSport';
            } else if (tLower.includes('film') || tLower.includes('artis') || tLower.includes('konser') || tLower.includes('lagu')) {
              cat = 'entertainment';
              channel = 'detikHot';
            } else if (tLower.includes('kesehatan') || tLower.includes('penyakit') || tLower.includes('sains') || tLower.includes('obat')) {
              cat = 'science';
              channel = 'detikHealth';
            }

            const categoryStockImages: Record<NewsCategory, string> = {
              technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
              business: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
              politics: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
              sports: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
              entertainment: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
              science: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
              world: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
              contributor: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
              all: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'
            };

            parsedDetik.push({
              id: `detik-live-${index}-${Date.now()}`,
              title: title.startsWith(channel) ? title : `${channel}: ${title}`,
              description: description.slice(0, 180) + '...',
              content: `${title}\n\nJAKARTA (detikcom) — ${description}\n\nBerita ini diprioritaskan langsung dari Headline News portal detik.com. Untuk membaca laporan investigasi dan liputan lengkap, kunjungi situs resmi detik.com melalui tautan sumber di bawah.`,
              url: link,
              imageUrl: enclosure || categoryStockImages[cat],
              source: 'detikcom',
              category: cat,
              publishedAt: new Date(pubDate).toISOString(),
              readingTime: 3,
              isTrending: true,
              trendingScore: 98 - index,
              commentsCount: Math.floor(Math.random() * 25) + 5,
              isDetikHeadline: true,
              detikChannel: channel,
              keywords: title.toLowerCase().split(' ').filter(w => w.length > 3)
            });
          });

          if (parsedDetik.length > 0) {
            const existingTitles = new Set(this.articles.map(a => a.title.toLowerCase()));
            const newDetik = parsedDetik.filter(a => !existingTitles.has(a.title.toLowerCase()));
            // Prioritize at the top
            this.articles = [...newDetik, ...this.articles];
            return parsedDetik;
          }
        }
      }
    } catch (e) {
      console.warn('Detik RSS live proxy fallback:', e);
    }

    return INITIAL_DETIK_HEADLINES;
  }

  public static async fetchLiveFeed(category: NewsCategory | 'detikcom' = 'all'): Promise<NewsArticle[]> {
    // Always refresh Detik headlines first as highest priority
    await this.fetchDetikHeadlines();
    return this.getArticles(category);
  }
}
