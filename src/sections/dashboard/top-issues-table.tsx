import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';

// ----------------------------------------------------------------------

interface TopIssuesTableProps {
  data: Array<{
    issue: string;
    count: number;
  }>;
}

export function TopIssuesTable({ data }: TopIssuesTableProps) {
  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <Card>
      <CardHeader title="Top Issues" />
      <CardContent>
        <TableContainer sx={{ maxHeight: 300 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Issue</TableCell>
                <TableCell align="right">Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>{row.issue}</TableCell>
                  <TableCell align="right">
                    <Chip label={row.count} size="small" color="primary" variant="outlined" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
