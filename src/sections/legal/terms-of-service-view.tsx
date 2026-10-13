import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';

// ----------------------------------------------------------------------

export function TermsOfServiceView() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 3 }} variant="outlined">
        ← Back
      </Button>

      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h3" sx={{ mb: 4 }}>
          Persyaratan Layanan - Densus 88 Antiteror
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          Selamat datang di Densus 88 Antiteror. Platform ini adalah layanan analisis sentimen dan
          peringatan dini kontraterorisme yang membantu Densus 88 Antiteror Polri memahami narasi
          ekstremisme melalui analisis OSINT dari berbagai sumber digital. Dengan menggunakan layanan kami, Anda menyetujui
          ketentuan berikut:
        </Typography>

        <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
          1. Ketentuan Umum
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 3 }}>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Pengguna wajib mematuhi semua hukum dan peraturan yang berlaku saat menggunakan
              layanan Densus 88 Antiteror.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Densus 88 Antiteror berhak memperbarui atau mengubah ketentuan layanan kapan saja tanpa
              pemberitahuan sebelumnya.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Layanan hanya dapat digunakan untuk tujuan yang sah dan tidak boleh digunakan untuk
              aktivitas yang melanggar hukum.
            </Typography>
          </li>
        </Box>

        <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
          2. Akun dan Keamanan
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 3 }}>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Pengguna bertanggung jawab atas keamanan akun mereka, termasuk menjaga kerahasiaan
              kata sandi.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Densus 88 Antiteror tidak bertanggung jawab atas kehilangan atau penyalahgunaan akun akibat
              kelalaian pengguna.
            </Typography>
          </li>
        </Box>

        <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
          3. Penggunaan Data
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 3 }}>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Data yang dikumpulkan melalui layanan Densus 88 Antiteror hanya boleh digunakan sesuai dengan
              kebijakan dan peraturan yang berlaku.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Pelanggaran terhadap ketentuan ini dapat mengakibatkan penghentian layanan atau
              pemblokiran akun.
            </Typography>
          </li>
        </Box>

        <Typography variant="body1" sx={{ mt: 4 }}>
          Jika ada pertanyaan, hubungi kami di{' '}
          <Box
            component="a"
            href="mailto:mail@propam.polri.go.id"
            sx={{ color: 'primary.main', textDecoration: 'none' }}
          >
            mail@propam.polri.go.id
          </Box>
        </Typography>

        {/* English Version */}
        <Typography variant="h3" sx={{ mb: 4, mt: 6 }}>
          Terms of Service - Densus 88 Antiteror
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          Welcome to Densus 88 Antiteror. This platform is a sentiment analysis and counter-terrorism early warning
          service that helps the Indonesian National Police Densus 88 Anti-Terror Detachment understand
          extremist narratives through OSINT analysis from various digital sources. By using our
          services, you agree to the following terms:
        </Typography>

        <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
          1. General Terms
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 3 }}>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Users must comply with all applicable laws and regulations when using Densus 88 Antiteror
              services.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Densus 88 Antiteror reserves the right to update or modify the terms of service at any time
              without prior notice.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              The service may only be used for lawful purposes and must not be used for illegal
              activities.
            </Typography>
          </li>
        </Box>

        <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
          2. Account and Security
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 3 }}>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Users are responsible for securing their accounts, including keeping passwords
              confidential.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Densus 88 Antiteror is not responsible for loss or misuse of accounts due to user negligence.
            </Typography>
          </li>
        </Box>

        <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
          3. Data Usage
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 3 }}>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Data collected through Densus 88 Antiteror services may only be used in accordance with
              applicable policies and regulations.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Violation of these terms may result in service termination or account suspension.
            </Typography>
          </li>
        </Box>

        <Typography variant="body1" sx={{ mt: 4 }}>
          For inquiries, contact us at{' '}
          <Box
            component="a"
            href="mailto:mail@propam.polri.go.id"
            sx={{ color: 'primary.main', textDecoration: 'none' }}
          >
            mail@propam.polri.go.id
          </Box>
        </Typography>
      </Paper>
    </Container>
  );
}
