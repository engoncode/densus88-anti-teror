// src/sections/artist/view/artist-verification-view.tsx
import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import type { ArtistProfile } from 'src/types/artist';

import artistService from 'src/services/artistService';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ArtistVerificationView() {
  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPendingArtists = useCallback(async () => {
    try {
      setLoading(true);
      const data = await artistService.getPendingVerifications();
      setArtists(data);
    } catch (error) {
      console.error('Failed to load pending artists:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingArtists();
  }, [loadPendingArtists]);

  const handleApprove = useCallback(
    async (userId: number) => {
      try {
        await artistService.verifyDirect(userId, { status: 'approved' });
        loadPendingArtists();
      } catch (error) {
        console.error('Failed to approve artist:', error);
      }
    },
    [loadPendingArtists]
  );

  const handleReject = useCallback(
    async (userId: number) => {
      try {
        await artistService.verifyDirect(userId, { status: 'rejected' });
        loadPendingArtists();
      } catch (error) {
        console.error('Failed to reject artist:', error);
      }
    },
    [loadPendingArtists]
  );

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Artist Verification</Typography>
      </Stack>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Sample Artwork</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : artists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No pending verifications
                  </TableCell>
                </TableRow>
              ) : (
                artists.map((artist) => (
                  <TableRow key={artist.id}>
                    <TableCell>{artist.name}</TableCell>
                    <TableCell>{artist.user?.email}</TableCell>
                    <TableCell>{artist.specialization}</TableCell>
                    <TableCell>
                      {artist.sample_artwork_image && (
                        <Box
                          component="img"
                          src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}/storage/${artist.sample_artwork_image}`}
                          alt={artist.sample_artwork_title || 'Sample artwork'}
                          sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          color="success"
                          variant="contained"
                          startIcon={<Iconify icon="solar:check-circle-bold" />}
                          onClick={() => artist.user && handleApprove(artist.user.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          startIcon={<Iconify icon="solar:pen-bold" />}
                          onClick={() => artist.user && handleReject(artist.user.id)}
                        >
                          Reject
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Container>
  );
}
