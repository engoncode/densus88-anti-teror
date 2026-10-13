// src/sections/settings/view/settings-view.tsx
import { useCallback, useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Slider from '@mui/material/Slider';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import settingsService, {
  type CommissionSettings,
  type PaymentSettings,
  type OrderSettings,
  type GeneralSettings,
} from 'src/services/settingsService';
import type { OfficeShippingAddress, Province, Regency } from 'src/types/settings';

// Helper function to format currency
const formatRupiah = (value: number): string => {
  return value.toLocaleString('id-ID');
};

// ----------------------------------------------------------------------

export function SettingsView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Commission Settings
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings | null>(null);
  const [artistRate, setArtistRate] = useState(80);
  const [minWithdrawal, setMinWithdrawal] = useState(100000);

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [paymentExpiry, setPaymentExpiry] = useState(24);

  // Order Settings
  const [orderSettings, setOrderSettings] = useState<OrderSettings | null>(null);
  const [autoCompleteDays, setAutoCompleteDays] = useState(7);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);
  const [siteName, setSiteName] = useState('');
  const [siteTagline, setSiteTagline] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [siteEmail, setSiteEmail] = useState('');
  const [sitePhone, setSitePhone] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [siteInstagram, setSiteInstagram] = useState('');
  const [siteFacebook, setSiteFacebook] = useState('');
  const [siteTwitter, setSiteTwitter] = useState('');
  const [siteWhatsapp, setSiteWhatsapp] = useState('');

  // Office Shipping Address
  const [officeAddress, setOfficeAddress] = useState<OfficeShippingAddress | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | ''>('');
  const [selectedRegencyId, setSelectedRegencyId] = useState<number | ''>('');
  const [officeFullAddress, setOfficeFullAddress] = useState('');
  const [officePostalCode, setOfficePostalCode] = useState('');

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const [commission, payment, order, general, office, provincesData] = await Promise.all([
        settingsService.getCommissionSettings(),
        settingsService.getPaymentSettings(),
        settingsService.getOrderSettings(),
        settingsService.getGeneralSettings(),
        settingsService.getOfficeAddress(),
        settingsService.getProvinces(),
      ]);

      setCommissionSettings(commission);
      setArtistRate(commission.artist_commission_rate);
      setMinWithdrawal(commission.min_withdrawal_amount);

      setPaymentSettings(payment);
      setPaymentExpiry(payment.payment_expiry_hours);

      setOrderSettings(order);
      setAutoCompleteDays(order.auto_complete_days);

      setGeneralSettings(general);
      setSiteName(general.site_name);
      setSiteTagline(general.site_tagline || '');
      setSiteDescription(general.site_description || '');
      setSiteEmail(general.site_email);
      setSitePhone(general.site_phone);
      setSiteAddress(general.site_address || '');
      setSiteInstagram(general.site_instagram || '');
      setSiteFacebook(general.site_facebook || '');
      setSiteTwitter(general.site_twitter || '');
      setSiteWhatsapp(general.site_whatsapp || '');

      // Office Address
      setOfficeAddress(office);
      setProvinces(provincesData);
      if (office?.province_id) {
        setSelectedProvinceId(office.province_id);
        // Load regencies for selected province
        const regenciesData = await settingsService.getRegencies(office.province_id);
        setRegencies(regenciesData);
      }
      if (office?.regency_id) {
        setSelectedRegencyId(office.regency_id);
      }
      setOfficeFullAddress(office?.full_address || '');
      setOfficePostalCode(office?.postal_code || '');
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load settings',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveCommission = async () => {
    try {
      setSaving('commission');
      await settingsService.updateCommissionSettings({
        artist_commission_rate: artistRate,
        min_withdrawal_amount: minWithdrawal,
      });
      setSnackbar({
        open: true,
        message: 'Commission settings saved successfully',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save commission settings',
        severity: 'error',
      });
    } finally {
      setSaving(null);
    }
  };

  const handleSavePayment = async () => {
    try {
      setSaving('payment');
      await settingsService.updatePaymentSettings({
        payment_expiry_hours: paymentExpiry,
        min_withdrawal_amount: minWithdrawal,
      });
      setSnackbar({
        open: true,
        message: 'Payment settings saved successfully',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save payment settings',
        severity: 'error',
      });
    } finally {
      setSaving(null);
    }
  };

  const handleSaveOrder = async () => {
    try {
      setSaving('order');
      await settingsService.updateOrderSettings({
        auto_complete_days: autoCompleteDays,
      });
      setSnackbar({
        open: true,
        message: 'Order settings saved successfully',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save order settings',
        severity: 'error',
      });
    } finally {
      setSaving(null);
    }
  };

  const handleSaveGeneral = async () => {
    try {
      setSaving('general');
      await settingsService.updateGeneralSettings({
        site_name: siteName,
        site_tagline: siteTagline,
        site_description: siteDescription,
        site_email: siteEmail,
        site_phone: sitePhone,
        site_address: siteAddress,
        site_instagram: siteInstagram,
        site_facebook: siteFacebook,
        site_twitter: siteTwitter,
        site_whatsapp: siteWhatsapp,
      });
      setSnackbar({
        open: true,
        message: 'General settings saved successfully',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save general settings',
        severity: 'error',
      });
    } finally {
      setSaving(null);
    }
  };

  const handleProvinceChange = async (provinceId: number) => {
    setSelectedProvinceId(provinceId);
    setSelectedRegencyId('');
    setRegencies([]);

    if (provinceId) {
      try {
        const regenciesData = await settingsService.getRegencies(provinceId);
        setRegencies(regenciesData);
      } catch (error) {
        console.error('Failed to load regencies:', error);
      }
    }
  };

  const handleSaveOfficeAddress = async () => {
    if (!selectedProvinceId || !selectedRegencyId) {
      setSnackbar({
        open: true,
        message: 'Please select province and regency',
        severity: 'error',
      });
      return;
    }

    try {
      setSaving('office');
      await settingsService.updateOfficeAddress({
        province_id: selectedProvinceId as number,
        regency_id: selectedRegencyId as number,
        full_address: officeFullAddress,
        postal_code: officePostalCode,
      });
      setSnackbar({
        open: true,
        message: 'Office address saved successfully',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save office address',
        severity: 'error',
      });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Settings
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 12, md: 6 }} key={i}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="40%" height={32} />
                  <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 3 }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Commission Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Commission Settings"
              subheader="Configure artist commission rates"
              avatar={<Iconify icon="solar:wallet-money-bold" width={24} />}
            />
            <Divider />
            <CardContent>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Artist Commission Rate
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Slider
                      value={artistRate}
                      onChange={(_e, val) => setArtistRate(val as number)}
                      min={0}
                      max={100}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(val) => `${val}%`}
                      sx={{ flex: 1 }}
                    />
                    <Typography variant="h6" sx={{ minWidth: 60, textAlign: 'right' }}>
                      {artistRate}%
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Artist receives: {artistRate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Platform receives: {100 - artistRate}%
                    </Typography>
                  </Stack>
                </Box>

                <TextField
                  label="Minimum Withdrawal Amount"
                  type="number"
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(Number(e.target.value))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  }}
                  helperText={`Current: Rp ${formatRupiah(minWithdrawal)}`}
                  fullWidth
                />

                <Button
                  variant="contained"
                  onClick={handleSaveCommission}
                  disabled={saving === 'commission'}
                  startIcon={<Iconify icon="eva:save-fill" />}
                >
                  {saving === 'commission' ? 'Saving...' : 'Save Commission Settings'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Payment Settings"
              subheader="Configure payment options"
              avatar={<Iconify icon="solar:card-bold" width={24} />}
            />
            <Divider />
            <CardContent>
              <Stack spacing={3}>
                <TextField
                  label="Payment Expiry Time"
                  type="number"
                  value={paymentExpiry}
                  onChange={(e) => setPaymentExpiry(Number(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">hours</InputAdornment>,
                  }}
                  helperText="Time before unpaid order expires (1-168 hours)"
                  fullWidth
                />

                <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
                  Orders not paid within {paymentExpiry} hours will be automatically cancelled.
                </Alert>

                <Button
                  variant="contained"
                  onClick={handleSavePayment}
                  disabled={saving === 'payment'}
                  startIcon={<Iconify icon="eva:save-fill" />}
                >
                  {saving === 'payment' ? 'Saving...' : 'Save Payment Settings'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Order Settings"
              subheader="Configure order processing"
              avatar={<Iconify icon="solar:box-bold" width={24} />}
            />
            <Divider />
            <CardContent>
              <Stack spacing={3}>
                <TextField
                  label="Auto Complete Days"
                  type="number"
                  value={autoCompleteDays}
                  onChange={(e) => setAutoCompleteDays(Number(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">days</InputAdornment>,
                  }}
                  helperText="Days after delivery before order auto-completes (1-30 days)"
                  fullWidth
                />

                <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
                  Orders will be automatically completed {autoCompleteDays} days after delivery if
                  buyer doesn&apos;t confirm.
                </Alert>

                <Button
                  variant="contained"
                  onClick={handleSaveOrder}
                  disabled={saving === 'order'}
                  startIcon={<Iconify icon="eva:save-fill" />}
                >
                  {saving === 'order' ? 'Saving...' : 'Save Order Settings'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* General Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="General Settings"
              subheader="Site information"
              avatar={<Iconify icon="solar:settings-bold-duotone" width={24} />}
            />
            <Divider />
            <CardContent>
              <Stack spacing={3}>
                <TextField
                  label="Site Name"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Site Tagline"
                  value={siteTagline}
                  onChange={(e) => setSiteTagline(e.target.value)}
                  placeholder="Where Art Finds Its Home"
                  fullWidth
                />

                <TextField
                  label="Site Description"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  multiline
                  rows={2}
                  fullWidth
                />

                <TextField
                  label="Contact Email"
                  type="email"
                  value={siteEmail}
                  onChange={(e) => setSiteEmail(e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Contact Phone"
                  value={sitePhone}
                  onChange={(e) => setSitePhone(e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Address"
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  multiline
                  rows={2}
                  fullWidth
                />

                <Button
                  variant="contained"
                  onClick={handleSaveGeneral}
                  disabled={saving === 'general'}
                  startIcon={<Iconify icon="eva:save-fill" />}
                >
                  {saving === 'general' ? 'Saving...' : 'Save General Settings'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Social Media Settings */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Social Media"
              subheader="Social media links"
              avatar={<Iconify icon="solar:share-bold" width={24} />}
            />
            <Divider />
            <CardContent>
              <Stack spacing={3}>
                <TextField
                  label="Instagram URL"
                  value={siteInstagram}
                  onChange={(e) => setSiteInstagram(e.target.value)}
                  placeholder="https://instagram.com/yourpage"
                  fullWidth
                />

                <TextField
                  label="Facebook URL"
                  value={siteFacebook}
                  onChange={(e) => setSiteFacebook(e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  fullWidth
                />

                <TextField
                  label="Twitter/X URL"
                  value={siteTwitter}
                  onChange={(e) => setSiteTwitter(e.target.value)}
                  placeholder="https://x.com/yourpage"
                  fullWidth
                />

                <TextField
                  label="WhatsApp Number"
                  value={siteWhatsapp}
                  onChange={(e) => setSiteWhatsapp(e.target.value)}
                  placeholder="+6281234567890"
                  helperText="Include country code (e.g., +62 for Indonesia)"
                  fullWidth
                />

                <Button
                  variant="contained"
                  onClick={handleSaveGeneral}
                  disabled={saving === 'general'}
                  startIcon={<Iconify icon="eva:save-fill" />}
                >
                  {saving === 'general' ? 'Saving...' : 'Save Social Media Settings'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Office Shipping Address */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="Office Shipping Address"
              subheader="Origin address for LaPalapa artwork shipments (used for shipping cost calculation)"
              avatar={<Iconify icon="solar:map-point-bold" width={24} />}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Province *</InputLabel>
                    <Select
                      value={selectedProvinceId}
                      label="Province *"
                      onChange={(e) => handleProvinceChange(e.target.value as number)}
                    >
                      {provinces.map((province) => (
                        <MenuItem key={province.id} value={province.id}>
                          {province.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth disabled={!selectedProvinceId}>
                    <InputLabel>Regency/City *</InputLabel>
                    <Select
                      value={selectedRegencyId}
                      label="Regency/City *"
                      onChange={(e) => setSelectedRegencyId(e.target.value as number)}
                    >
                      {regencies.map((regency) => (
                        <MenuItem key={regency.id} value={regency.id}>
                          {regency.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    label="Full Address"
                    value={officeFullAddress}
                    onChange={(e) => setOfficeFullAddress(e.target.value)}
                    placeholder="Jl. Example No. 123, Kelurahan, Kecamatan"
                    multiline
                    rows={2}
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Postal Code"
                    value={officePostalCode}
                    onChange={(e) => setOfficePostalCode(e.target.value)}
                    placeholder="12345"
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
                    This address is used as the shipping origin for artworks sold directly by
                    LaPalapa. Make sure to select the correct province and regency for accurate
                    shipping cost calculation.
                  </Alert>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="contained"
                    onClick={handleSaveOfficeAddress}
                    disabled={saving === 'office'}
                    startIcon={<Iconify icon="eva:save-fill" />}
                  >
                    {saving === 'office' ? 'Saving...' : 'Save Office Address'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
