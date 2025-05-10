# NCFI Prayer

**NCFI Prayer** adalah aplikasi web dan mobile yang dikembangkan untuk memperkuat keterhubungan spiritual komunitas perawat Kristen di seluruh dunia. Aplikasi ini memfasilitasi permohonan doa, pembinaan rohani, dan koneksi lintas wilayah dalam lingkungan yang aman, gratis, dan mudah digunakan.

## Teknologi

Proyek ini dikembangkan menggunakan [T3 App Stack](https://create.t3.gg/), yang mencakup:

- **Next.js** – Framework full-stack React
- **TypeScript** – Bahasa pemrograman statis modern
- **Tailwind CSS** – Utility-first CSS
- **tRPC** – API tanpa skema yang efisien
- **Prisma ORM** – Manajemen basis data yang kuat
- **NextAuth.js** – Otentikasi modern

## Instalasi

### Prasyarat

- Node.js >= 18
- PostgreSQL (atau database yang kompatibel)
- pnpm / npm / yarn

### Langkah-langkah

```bash
git clone https://github.com/yourusername/ncfi-prayer.git
cd ncfi-prayer
pnpm install
cp .env.example .env
npx prisma migrate dev --name init
pnpm dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

## Struktur Folder

```
/
├── src/
│   ├── pages/
│   ├── server/
│   ├── prisma/
│   ├── styles/
│   └── components/
├── public/
├── prisma/
├── .env.example
└── README.md
```

## Dokumentasi Proyek

Berikut adalah dokumen proyek yang relevan:

- [Proposal](https://uph365-my.sharepoint.com/:w:/g/personal/01082230009_student_uph_edu/ESs3NG3vzo1Kq32gGJEQmsoB-oofhDEH-OzJvCP4F8Un9w?e=bw2tJn)
- [Team Contract](https://uph365-my.sharepoint.com/:w:/g/personal/01082230009_student_uph_edu/EUqJOei2UydKgWeleA_2UOEBP1fr4P_yrGb3FSMy-zPXsw?e=XUb3Eb)
- [Template Project Planning](https://uph365-my.sharepoint.com/:w:/g/personal/01082230009_student_uph_edu/EdINl8T_SLBBp7vDR7SUXgkB67Yv4ShK3CqA15liu1aO2Q?e=WfkUtv)
- [SRS](https://uph365-my.sharepoint.com/:w:/g/personal/01082230009_student_uph_edu/ETymW9AB4DxPq-_LpU2o664BkOeC5zLawUs6VuicBjPJZQ?e=t2ladX)
- [Weekly Status Report](https://uph365-my.sharepoint.com/:w:/g/personal/01082230009_student_uph_edu/EdJt6jfUuihKsH1iKmy2DSgBOJ5jNurydr_-Tlu0lJtjdw?e=p7INTk)
- [Coding Standard & Convention](https://uph365-my.sharepoint.com/:w:/g/personal/01082230009_student_uph_edu/Ea_c0MgKPMdGkHDPm169HWIBgXZAbjid4Wt8w_H1nAupUA?e=LFNfNc)
- [Gantt Chart](https://uph365-my.sharepoint.com/:x:/g/personal/01082230023_student_uph_edu/EUNY-uM1-RJFi0KjPFRVLUQBs7x8zQOFsD5pCwQwVzPbdw?rtime=dkRv5_163Ug)
- [Burn Down Chart](https://uph365-my.sharepoint.com/:x:/g/personal/01082230009_student_uph_edu/Ees3AgGfjipBhVGtaIusJHAB_N4_x2IamZzlHTV9ViJSvw?e=i002Lu)
- [User Story](https://uph365-my.sharepoint.com/:x:/g/personal/01082230009_student_uph_edu/EXExsqV_EgxOrpCdgdse7UMBMSpMf14d4ltYB6DFn_5yRg?e=HrStEL)
- [Testing Plan](https://uph365-my.sharepoint.com/:x:/g/personal/01082230009_student_uph_edu/EYTKKl-lVzhHr4drMzL8DcMBFyTH7e_Lg_JUieEyYiTDqQ?e=GlzoSw)
- [Laporan Testing](https://uph365-my.sharepoint.com/:w:/g/personal/01082230009_student_uph_edu/Ee58A79cLCpPoc5CwkLPO5wBCk3rJmD96zbX8clJnriynw?e=iAcGm7)

## Kontak

Jika Anda memiliki pertanyaan atau ingin berkontribusi, silakan hubungi:

**Email:** 01082230015@student.uph.edu
