import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

export interface TableColumn<T> {
  id: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface AppTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
}

// Универсальный компонент таблицы. Принимает колонки и данные.
export const AppTable = <T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
}: AppTableProps<T>) => {
  return (
    <TableContainer component={Paper} elevation={1}>
      <Table>
        <TableHead sx={{ bgcolor: '#f8f9fa' }}>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id}>
                <b>{col.label}</b>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={keyExtractor(row)} hover>
              {columns.map((col) => (
                <TableCell key={col.id}>
                  {col.render ? col.render(row) : row[col.id as keyof T]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
