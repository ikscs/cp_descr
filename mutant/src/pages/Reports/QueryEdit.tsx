import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Grid,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SelectOptions from './SelectOptions';
import QueryTest from './QueryTest';

// --- Interfaces ---

export interface Param {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'date' | 'db_select';
  notNull: boolean;
  rules?: object;
  selectOptions?: string[];
  optionsQuery?: string; // For db_select type
}

type ParamKey = keyof Param;

// Mapped type to get the correct type for each ParamKey
type ParamValue<K extends ParamKey> = Param[K];

interface Column {
  field: string;
  label: string;
  width: number;
}

type ColumnKey = keyof Column;

// Mapped type to get the correct type for each ColumnKey
type ColumnValue<K extends ColumnKey> = Column[K];

export interface Chart {
  type: 'buble' | 'linear' | 'circular' | 'other';
  x_axis: { field: string };
  y_axis: { field: string };
  body_fields: string[];
  y_axis_label?: string;
}

export interface ReportConfig {
  params: Param[];
  columns?: Column[];
  chart?: Chart;
}

export interface ReportDescriptor {
  app_id: string;
  report_id: number;
  report_name: string;
  report_description: string;
  query: string;
  tag: string | null;
  report_config: ReportConfig;
}

// --- QueryParam Component ---

interface QueryParamProps {
  params: Param[];
  onSubmit: (queryParams: { [key: string]: any }) => void;
}

const QueryParam: React.FC<QueryParamProps> = ({ params, onSubmit }) => {
  const [queryParams, setQueryParams] = useState<{ [key: string]: any }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Initialize queryParams with default values
    const initialParams: { [key: string]: any } = {};
    params.forEach((param) => {
      initialParams[param.name] = param.type === 'boolean' ? false : '';
    });
    setQueryParams(initialParams);
  }, [params]);

  const handleChange = (name: string, value: any) => {
    setQueryParams({ ...queryParams, [name]: value });
    setErrors({ ...errors, [name]: '' }); // Clear error on change
  };

  const validate = () => {
    let isValid = true;
    const newErrors: { [key: string]: string } = {};
    params.forEach((param) => {
      if (param.notNull && !queryParams[param.name]) {
        newErrors[param.name] = 'This field is required';
        isValid = false;
      }
    });
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(queryParams);
    } else {
      //alert('Please fill in all required fields.');
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Report Parameters
      </Typography>
      <Grid container spacing={2}>
        {params.map((param) => (
          <Grid item xs={12} sm={6} key={param.name}>
            <FormControl fullWidth error={!!errors[param.name]}>
              {param.type === 'string' && (
                <TextField
                  label={param.description}
                  value={queryParams[param.name] || ''}
                  onChange={(e) => handleChange(param.name, e.target.value)}
                  error={!!errors[param.name]}
                  helperText={errors[param.name]}
                />
              )}
              {param.type === 'number' && (
                <TextField
                  label={param.description}
                  type="number"
                  value={queryParams[param.name] || ''}
                  onChange={(e) => handleChange(param.name, e.target.value)}
                  error={!!errors[param.name]}
                  helperText={errors[param.name]}
                />
              )}
              {param.type === 'boolean' && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={queryParams[param.name] || false}
                      onChange={(e) => handleChange(param.name, e.target.checked)}
                    />
                  }
                  label={param.description}
                />
              )}
              {param.type === 'select' && (
                <>
                  <InputLabel id={`${param.name}-select-label`}>{param.description}</InputLabel>
                  <Select
                    labelId={`${param.name}-select-label`}
                    id={`${param.name}-select`}
                    value={queryParams[param.name] || ''}
                    label={param.description}
                    onChange={(e) => handleChange(param.name, e.target.value)}
                  >
                    {param.selectOptions?.map((option, index) => (
                      <MenuItem key={index} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors[param.name] && <FormHelperText>{errors[param.name]}</FormHelperText>}
                </>
              )}
            </FormControl>
          </Grid>
        ))}
      </Grid>
      <Box mt={2}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Run Report
        </Button>
      </Box>
    </Box>
  );
};

// --- QueryEdit Component ---

interface QueryEditProps {
  initialData?: ReportDescriptor;
  onSubmit: (data: ReportDescriptor) => void;
  onClose: () => void; // Add onClose prop
}

const QueryEdit: React.FC<QueryEditProps> = ({ initialData, onSubmit, onClose }) => { // Add onClose to props
  const [reportData, setReportData] = useState<ReportDescriptor>(
    initialData || {
      app_id: '',
      report_id: 0,
      report_name: '',
      report_description: '',
      query: '',
      tag: null,
      report_config: { params: [] },
    }
  );
  const [tabValue, setTabValue] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSelectOptionsDialogOpen, setIsSelectOptionsDialogOpen] = useState(false);
  const [currentParamIndex, setCurrentParamIndex] = useState<number | null>(null);
  const [isQueryTestDialogOpen, setIsQueryTestDialogOpen] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChange = (field: string, value: any) => {
    setReportData({ ...reportData, [field]: value });
    setErrors({ ...errors, [field]: '' });
    //
    // handleConfigChange(field, value);
  };

  const handleConfigChange = (field: string, value: any) => {
    setReportData({
      ...reportData,
      report_config: { ...reportData.report_config, [field]: value },
    });
  };

  const handleParamChange = <K extends ParamKey>(
    index: number,
    field: K,
    value: ParamValue<K>
  ) => {
    const newParams = [...reportData.report_config.params];
    newParams[index][field] = value;
    handleConfigChange('params', newParams);
  };

  const handleAddParam = () => {
    handleConfigChange('params', [
      ...reportData.report_config.params,
      {
        name: '',
        description: '',
        type: 'string',
        notNull: false,
        // defaultValue: '', // No longer needed here as QueryParam initializes based on type
        optionsQuery: '',
      },    
    ]);
  };

  const handleDeleteParam = (index: number) => {
    const newParams = [...reportData.report_config.params];
    newParams.splice(index, 1);
    handleConfigChange('params', newParams);
  };

  const handleColumnChange = <K extends ColumnKey>(
    index: number,
    field: K,
    value: ColumnValue<K>
  ) => {
    const newColumns = [...(reportData.report_config.columns || [])];
    newColumns[index][field] = value;
    handleConfigChange('columns', newColumns);
  };

  const handleAddColumn = () => {
    handleConfigChange('columns', [
      ...(reportData.report_config.columns || []),
      { field: '', width: 100 },
    ]);
  };

  const handleDeleteColumn = (index: number) => {
    const newColumns = [...(reportData.report_config.columns || [])];
    newColumns.splice(index, 1);
    handleConfigChange('columns', newColumns);
  };

  const handleChartChange = (field: string, value: any) => {
    handleConfigChange('chart', { ...reportData.report_config.chart, [field]: value });
  };

  const handleSubmit = () => {
    let isValid = true;
    const newErrors: { [key: string]: string } = {};
    if (!reportData.report_name) {
      newErrors['report_name'] = 'Report name is required';
      isValid = false;
    }
    if (!reportData.query) {
      newErrors['query'] = 'Query is required';
      isValid = false;
    }
    setErrors(newErrors);
    if (isValid) {
      onSubmit(reportData);
    }
  };

  // --- Styles for fixed height ---
  const tabContentStyle = {
    minHeight: '400px', // Adjust this value as needed
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1, // Added flexGrow: 1 here!
  };

  const handleOpenSelectOptionsDialog = (index: number) => {
    setCurrentParamIndex(index);
    setIsSelectOptionsDialogOpen(true);
  };

  const handleCloseSelectOptionsDialog = () => {
    setIsSelectOptionsDialogOpen(false);
    setCurrentParamIndex(null);
  };

  const handleSaveSelectOptions = (newOptions: string[]) => {
    if (currentParamIndex !== null) {
      const newParams = [...reportData.report_config.params];
      newParams[currentParamIndex].selectOptions = newOptions;
      handleConfigChange('params', newParams);
    }
  };

  const handleOpenQueryTestDialog = () => {
    setIsQueryTestDialogOpen(true);
  };

  const handleCloseQueryTestDialog = () => {
    setIsQueryTestDialogOpen(false);
  };

  return (
    <Box sx={{p:2}}> {/* Добавлен отступ p: 2 */}
      <Typography variant="h6" gutterBottom>
        {/* Report Editor */}
      </Typography>
      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="General" />
          <Tab label="Parameters" />
          <Tab label="Query" />
          <Tab label="Columns" />
          <Tab label="Chart" />
        </Tabs>
      </Paper>
      <Box p={2} sx={tabContentStyle}> {/* Apply the fixed height style here */}
        {tabValue === 0 && (
          <Box>
            <TextField
              fullWidth
              label="Report Name"
              value={reportData.report_name}
              onChange={(e) => handleChange('report_name', e.target.value)}
              margin="normal"
              error={!!errors['report_name']}
              helperText={errors['report_name']}
            />
            <TextField
              fullWidth
              label="Report Description"
              value={reportData.report_description}
              onChange={(e) => handleChange('report_description', e.target.value)}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Tag"
              value={reportData.tag}
              onChange={(e) => handleChange('tag', e.target.value)}
              margin="normal"
            />
          </Box>
        )}
        {tabValue === 1 && (
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddParam}
              >
                Add Parameter
              </Button>
            </Box>
            <TableContainer component={Paper} sx={{ flexGrow: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Not Null</TableCell>
                    <TableCell>Options Query</TableCell> {/* New column for db_select */}
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.report_config.params.map((param, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          value={param.name}
                          onChange={(e) => handleParamChange(index, 'name', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={param.description}
                          onChange={(e) => handleParamChange(index, 'description', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={param.type}
                          onChange={(e) => handleParamChange(index, 'type', e.target.value as ParamValue<"type">)}
                        >
                          <MenuItem value="boolean">Boolean</MenuItem>
                          <MenuItem value="date">Date</MenuItem>
                          <MenuItem value="number">Number</MenuItem>
                          <MenuItem value="select">Select</MenuItem>
                          <MenuItem value="string">String</MenuItem>
                          <MenuItem value="db_select">DB Select</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={param.notNull}
                          onChange={(e) => handleParamChange(index, 'notNull', e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        {param.type === 'db_select' && (
                          <TextField
                            value={param.optionsQuery || ''}
                            onChange={(e) => handleParamChange(index, 'optionsQuery', e.target.value)}
                            placeholder="SELECT value, label FROM ..."
                            fullWidth
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleDeleteParam(index)}>
                          <DeleteIcon />
                        </IconButton>
                        {param.type === 'select' && (
                          <IconButton onClick={() => handleOpenSelectOptionsDialog(index)}>
                            <EditIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {tabValue === 2 && (
          <TextField
            fullWidth
            label="Query"
            value={reportData.query}
            onChange={(e) => handleChange('query', e.target.value)}
            margin="normal"
            multiline
            rows={15}
            error={!!errors['query']}
            helperText={errors['query']}
            sx={{ flexGrow: 1, height: '100%' }}
          />
        )}
        {tabValue === 3 && (
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddColumn}
              >
                Add Column
              </Button>
            </Box>
            <TableContainer component={Paper} sx={{ flexGrow: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Field</TableCell>
                    <TableCell>Label</TableCell>
                    <TableCell>Width</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(reportData.report_config.columns || []).map((column, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          value={column.field}
                          onChange={(e) => handleColumnChange(index, 'field', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={column.label}
                          onChange={(e) => handleColumnChange(index, 'label', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={column.width}
                          onChange={(e) => handleColumnChange(index, 'width', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleDeleteColumn(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {tabValue === 4 && (
          <Box>
            <FormControl fullWidth margin="normal">
              <InputLabel id="chart-type-label">Chart Type</InputLabel>
              <Select
                labelId="chart-type-label"
                id="chart-type"
                value={reportData.report_config.chart?.type || ''}
                label="Chart Type"
                onChange={(e) => handleChartChange('type', e.target.value)}
              >
                <MenuItem value="buble">Buble</MenuItem>
                <MenuItem value="linear">Linear</MenuItem>
                <MenuItem value="circular">Circular</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="X-Axis Field"
              value={reportData.report_config.chart?.x_axis?.field || ''}
              onChange={(e) => handleChartChange('x_axis', { field: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Y-Axis Field"
              value={reportData.report_config.chart?.y_axis?.field || ''}
              onChange={(e) => handleChartChange('y_axis', { field: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Body Fields (comma-separated)"
              value={reportData.report_config.chart?.body_fields?.join(',') || ''}
              onChange={(e) => handleChartChange('body_fields', e.target.value.split(','))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Y-Axis Label (Title)" // Метка для заголовка оси Y
              value={reportData.report_config.chart?.y_axis_label || ''}
              onChange={(e) => handleChartChange('y_axis_label', e.target.value)}
              margin="normal"
              helperText="Заголовок, отображаемый рядом с осью Y на линейном графике."
            />
          </Box>
        )}
      </Box>
      {/* Buttons Container */}
      <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="outlined" color="primary" onClick={onClose}>
          Закрыть
        </Button>
        <Button variant="contained" color="primary" onClick={handleOpenQueryTestDialog}>
          Тестовый отчет
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Сохранить
        </Button>
      </Box>
      {/* Select Options Dialog */}
      <Dialog open={isSelectOptionsDialogOpen} onClose={handleCloseSelectOptionsDialog}>
        <DialogTitle>Edit Select Options</DialogTitle>
        <DialogContent>
          {currentParamIndex !== null && (
            <SelectOptions
              options={reportData.report_config.params[currentParamIndex].selectOptions || []}
              onSave={handleSaveSelectOptions}
              onClose={handleCloseSelectOptionsDialog}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* Query Test Dialog */}
      <QueryTest
        _reportData={reportData}
        open={isQueryTestDialogOpen}
        onClose={handleCloseQueryTestDialog}
      />
    </Box>
  );
};

export { QueryParam, QueryEdit };
