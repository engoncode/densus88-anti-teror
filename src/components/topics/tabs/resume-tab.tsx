import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Divider } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import apiClient from 'src/services/apiService';

interface ResumeTabProps {
  topicId: number;
  network: string;
}

export default function ResumeTab({ topicId, network }: ResumeTabProps) {
  const [resumeContent, setResumeContent] = useState<string>('');
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Format date to Indonesian format
  const formatDateIndonesia = (dateString: string | null): string | null => {
    if (!dateString) return null;

    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    };

    return new Intl.DateTimeFormat('id-ID', options).format(date) + ' WIB';
  };

  useEffect(() => {
    const fetchResume = async () => {
      setLoading(true);
      try {
        const response = await apiClient.post<{
          resume: string;
          created_at: string;
        }>('/resume-ai', {
          topic_id: topicId,
          network,
        });

        setResumeContent(response.data.resume || '');
        setCreatedAt(response.data.created_at);
      } catch (err) {
        console.error('Error fetching resume:', err);
        // Set empty content on error, will show waiting message
        setResumeContent('');
      } finally {
        setLoading(false);
      }
    };

    if (topicId) {
      fetchResume();
    }
  }, [topicId, network]);

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" py={8}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Sedang mengambil data analisis...
        </Typography>
      </Box>
    );
  }

  if (!resumeContent) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <Typography variant="body2" color="text.secondary">
          Resume belum di-generate, tunggu beberapa saat
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {createdAt && (
        <>
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary">
              Dibuat pada: {formatDateIndonesia(createdAt)}
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
        </>
      )}

      <Box
        sx={{
          '& h1': { fontSize: '1.5rem', fontWeight: 'bold', mt: 3, mb: 2 },
          '& h2': { fontSize: '1.25rem', fontWeight: 'bold', mt: 2, mb: 1.5 },
          '& h3': { fontSize: '1.1rem', fontWeight: 'bold', mt: 2, mb: 1 },
          '& p': { mb: 2, lineHeight: 1.7 },
          '& ul, & ol': { pl: 3, mb: 2 },
          '& li': { mb: 1 },
          '& code': {
            px: 1,
            py: 0.5,
            borderRadius: 0.5,
            bgcolor: 'action.hover',
            fontSize: '0.875em',
          },
          '& pre': {
            p: 2,
            borderRadius: 1,
            bgcolor: 'action.hover',
            overflow: 'auto',
            mb: 2,
          },
          '& blockquote': {
            pl: 2,
            borderLeft: 3,
            borderColor: 'divider',
            fontStyle: 'italic',
            color: 'text.secondary',
            mb: 2,
          },
        }}
      >
        <ReactMarkdown>{resumeContent}</ReactMarkdown>
      </Box>
    </Box>
  );
}
