import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { getParams, updateParam } from "./SysParamService";
import { SysParam } from "./SysParamsTypes";

const renderField = (
  param: SysParam,
  value: any,
  onChange: (v: any) => void
) => {
  switch (param.display_type) {
    case "number":
      return (
        <TextField
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          size="small"
          fullWidth
        />
      );
    case "select":
      return (
        <FormControl fullWidth size="small">
          <InputLabel>{param.display_label}</InputLabel>
          <Select
            value={value}
            label={param.display_label}
            onChange={e => onChange(e.target.value)}
          >
            {(param.enum_values?.split(",") || []).map(opt => (
              <MenuItem key={opt.trim()} value={opt.trim()}>
                {opt.trim()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    case "checkbox":
      return (
        <FormControlLabel
          control={
            <Switch
              checked={!!value}
              onChange={e => onChange(e.target.checked)}
            />
          }
          label=""
        />
      );
    case "radio":
      return (
        <FormControl>
          <FormLabel>{param.display_label}</FormLabel>
          <RadioGroup
            row
            name={param.name}
            value={value}
            onChange={e => onChange(e.target.value)}
          >
            {(param.enum_values?.split(",") || []).map(opt => (
              <FormControlLabel
                key={opt.trim()}
                value={opt.trim()}
                control={<Radio />}
                label={opt.trim()}
              />
            ))}
          </RadioGroup>
        </FormControl>
      );
    default:
      return (
        <TextField
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          size="small"
          fullWidth
        />
      );
  }
};

export default function SysParamsForm() {
  const [params, setParams] = useState<SysParam[]>([]);
  const [form, setForm] = useState<Record<number, any>>({});
  const [initialForm, setInitialForm] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParams().then(data => {
      setParams(data);
      const initial: Record<number, any> = {};
      data.forEach((p: SysParam) => {
        initial[p.id] = p.value?.value ?? "";
      });
      setForm(initial);
      setInitialForm(initial);
      setLoading(false);
    });
  }, []);

  const handleChange = (id: number, value: any) => {
    setForm(f => ({ ...f, [id]: value }));
  };

  const isChanged = () => {
    return Object.keys(form).some(
      key => form[key as any] !== initialForm[key as any]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await Promise.all(
      params.map(param =>
        updateParam(param.id, { value: { value: form[param.id] } })
      )
    );
    setInitialForm({ ...form }); // сбросить исходные значения после сохранения
    alert("Параметри збережені");
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: "auto" }}>
      <Typography variant="h5" align="center" gutterBottom>
        Параметри системи
      </Typography>      
      {params
        .sort((a, b) => a.view_order - b.view_order)
        .map(param => (
          <Box key={param.id} mb={3}>
            <FormControl fullWidth>
              <Box display="flex" alignItems="center" mb={1}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  {param.display_label}
                  {param.eu && <span style={{ color: "#888" }}> ({param.eu})</span>}
                </Typography>
              </Box>
              {renderField(param, form[param.id], v => handleChange(param.id, v))}
              {param.description && (
                <Typography variant="caption" color="text.secondary">
                  {param.description}
                </Typography>
              )}
            </FormControl>
          </Box>
        ))}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={!isChanged()}
      >
        Зберегти
      </Button>
    </Box>
  );
}