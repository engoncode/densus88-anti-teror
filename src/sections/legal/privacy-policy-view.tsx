import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';

// ----------------------------------------------------------------------

export function PrivacyPolicyView() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 3 }} variant="outlined">
        ← Back
      </Button>

      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h3" sx={{ mb: 4 }}>
          Kebijakan Privasi - Propam Polri
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          Propam Polri berkomitmen untuk melindungi privasi pengguna kami. Kebijakan privasi ini
          menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi
          Anda.
        </Typography>

        <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
          1. Informasi yang Kami Kumpulkan
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 3 }}>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Data Akun:</strong> Email, nama, dan informasi profil yang Anda berikan saat
              registrasi.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Data Penggunaan:</strong> Informasi tentang bagaimana Anda menggunakan layanan
              kami, termasuk log aktivitas.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Data Analisis:</strong> Topik yang Anda monitor dan data sentimen yang
              dikumpulkan.
            </Typography>
          </li>
        </Box>

        <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
          2. Bagaimana Kami Menggunakan Informasi
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 3 }}>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Menyediakan dan meningkatkan layanan analisis sentimen
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Mengirim notifikasi dan update terkait layanan
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Menganalisis penggunaan untuk meningkatkan kualitas layanan
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Mematuhi kewajiban hukum dan regulasi
            </Typography>
          </li>
        </Box>

        <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
          3. Keamanan Data
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Kami menggunakan langkah-langkah keamanan industri standar untuk melindungi data Anda,
          termasuk:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 3 }}>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Enkripsi data saat transit dan penyimpanan
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Akses terbatas ke data pengguna
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Audit keamanan berkala
            </Typography>
          </li>
        </Box>

        <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
          4. Berbagi Informasi
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Kami tidak akan membagikan informasi pribadi Anda kepada pihak ketiga kecuali:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 3 }}>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Dengan persetujuan eksplisit Anda
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Untuk mematuhi kewajiban hukum
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Untuk melindungi hak dan keamanan kami atau pihak lain
            </Typography>
          </li>
        </Box>

        <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
          5. Hak Pengguna
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Anda memiliki hak untuk:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 3 }}>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Mengakses data pribadi Anda
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Meminta koreksi data yang tidak akurat
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Menghapus akun dan data Anda
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Menolak penggunaan data tertentu
            </Typography>
          </li>
        </Box>

        <Typography variant="body1" sx={{ mt: 4 }}>
          Untuk pertanyaan tentang kebijakan privasi ini, hubungi kami di{' '}
          <Box
            component="a"
            href="mailto:privacy@propam.polri.go.id"
            sx={{ color: 'primary.main', textDecoration: 'none' }}
          >
            privacy@propam.polri.go.id
          </Box>
        </Typography>

        <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
          Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
        </Typography>
      </Paper>
    </Container>
  );
}
